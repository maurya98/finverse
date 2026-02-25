import { sendError } from "@finverse/utils";
import { logger } from "@finverse/logger";
import { Request, Response } from "express";
import { ClientAppService } from "../services";
import { verifySignature } from "../../utils/verifySignature.util";
import { compilePath, extractParams } from "../../utils/matchPath.util";
import type { IncomingHttpHeaders } from "http";

/**
 * Headers that should not be forwarded to the internal service:
 * - host: destination-specific
 * - x-client-id, x-signature: gateway authentication headers
 * - content-length, transfer-encoding: recalculated by fetch based on actual body
 * - connection, keep-alive, upgrade: connection-specific, not applicable to proxied request
 * - te, trailer: transfer encoding negotiation, handled by fetch
 * - proxy-*, via, forwarded: proxy tracking headers
 */
type FilteredHeaders = Omit<
    IncomingHttpHeaders,
    | "host"
    | "x-client-id"
    | "x-signature"
    | "content-length"
    | "transfer-encoding"
    | "connection"
    | "keep-alive"
    | "upgrade"
    | "te"
    | "trailer"
    | "proxy-authenticate"
    | "proxy-authorization"
    | "via"
    | "forwarded"
>;

type PermissionWithRoute = {
    path: string;
    internalPath: string;
    method?: string;
    route?: {
        id: string;
        path: string;
        method: string;
    };
    service?: {
        id: string;
        name: string;
        baseUrl: string;
        createdAt: Date;
    };
};

type ClientAppWithPermissions = {
    id: string;
    name: string;
    secret: string;
    createdAt: Date;
    permissions?: PermissionWithRoute[];
};

// Helper Functions
function filterHeaders(headers: IncomingHttpHeaders): FilteredHeaders {
    // Create a copy and remove problematic headers
    const filtered = { ...headers };
    delete filtered.host;
    delete filtered["x-client-id"];
    delete filtered["x-signature"];
    delete filtered["content-length"];
    delete filtered["transfer-encoding"];
    delete filtered.connection;
    delete filtered["keep-alive"];
    delete filtered.upgrade;
    delete filtered.te;
    delete filtered.trailer;
    delete filtered["proxy-authenticate"];
    delete filtered["proxy-authorization"];
    delete filtered.via;
    delete filtered.forwarded;
    return filtered as FilteredHeaders;
}

function buildInternalPath(
    internalPath: string,
    params: Record<string, string>
): string {
    let path = internalPath;
    Object.entries(params).forEach(([key, value]) => {
        path = path.replace(`:${key}`, value);
    });
    return path;
}

function getPathOnly(url: string): string {
    return url.split('?')[0];
}

function getQueryString(url: string): string {
    return url.includes('?') ? url.split('?').slice(1).join('?') : '';
}

// Authentication & Validation
function validateClientCredentials(
    clientId: string | undefined,
    signature: string | undefined
): { valid: boolean; error?: string } {
    if (!clientId || !signature) {
        return {
            valid: false,
            error: "Unauthorized: Missing client ID or signature"
        };
    }
    return { valid: true };
}

async function verifyClientSignature(
    clientId: string,
    signature: string,
    payload: string
): Promise<{ verified: boolean; app: ClientAppWithPermissions | null; error?: string }> {
    const foundApp = await ClientAppService.getInstance()
        .getClientAppByIdWithRoutePermissions(clientId) as ClientAppWithPermissions | null;

    if (!foundApp || !Array.isArray(foundApp.permissions)) {
        return {
            verified: false,
            app: null,
            error: "Unauthorized: Invalid client ID"
        };
    }

    const isValid = verifySignature(payload, signature, foundApp.secret);
    if (!isValid) {
        return {
            verified: false,
            app: null,
            error: "Unauthorized: Invalid signature"
        };
    }

    return { verified: true, app: foundApp };
}

// Permission Matching
interface MatchedPermission {
    permission: PermissionWithRoute;
    params: Record<string, string>;
}

function matchPermissionToRequest(
    req: Request,
    permission: PermissionWithRoute
): MatchedPermission | null {
    // Skip if path is not defined
    if (!permission.path) return null;

    // Check method mismatch
    if (permission.method && permission.method !== req.method) {
        if (process.env.NODE_ENV === "development") {
            logger.debug({ permissionMethod: permission.method, reqMethod: req.method }, "Gateway: Method mismatch");
        }
        return null;
    }

    // Try to match path
    const pathOnly = getPathOnly(req.originalUrl);
    const compiledPath = compilePath(permission.path);
    const params = extractParams(compiledPath, pathOnly);

    if (process.env.NODE_ENV === "development") {
        logger.debug({ compiledPath: permission.path, params }, "Gateway: Path match result");
    }

    return params ? { permission, params } : null;
}

function findMatchingPermission(
    req: Request,
    permissions: PermissionWithRoute[]
): MatchedPermission | null {
    for (const permission of permissions) {
        if (process.env.NODE_ENV === "development") {
            logger.debug({ permission, url: req.originalUrl }, "Gateway: Checking permission");
        }

        const matched = matchPermissionToRequest(req, permission);
        if (matched) {
            return matched;
        }
    }
    return null;
}

// Request Proxying
async function proxyRequestToInternalService(
    req: Request,
    targetUrl: string
): Promise<{ status: number; data: string | object }> {
    const forwardedHeaders = filterHeaders(req.headers);
    const requestBody = req.method !== 'GET' && req.method !== 'HEAD'
        ? JSON.stringify(req.body)
        : undefined;

    if (process.env.NODE_ENV === "development") {
        logger.debug(
            { forwardedHeaders, method: req.method, targetUrl, bodyLength: requestBody?.length },
            "Gateway: Sending request to internal service"
        );
    }

    try {
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: forwardedHeaders as Record<string, string>,
            body: requestBody,
        });

        const responseData = await response.json().catch(() => response.text());

        if (process.env.NODE_ENV === "development") {
            logger.debug(
                { status: response.status, responseData },
                "Gateway: Received response from internal service"
            );
        }

        return { status: response.status, data: responseData };
    } catch (proxyError) {
        const errorMessage = proxyError instanceof Error ? proxyError.message : String(proxyError);
        const errorStack = proxyError instanceof Error ? proxyError.stack : undefined;
        const errorCause = proxyError instanceof Error ? proxyError.cause : undefined;
        const errorObj = proxyError as NodeJS.ErrnoException;

        logger.error(
            {
                errorMessage,
                errorStack,
                errorCause,
                targetUrl,
                errno: errorObj?.errno,
                code: errorObj?.code,
                syscall: errorObj?.syscall,
            },
            "Gateway: Error proxying request to internal service"
        );

        throw new Error("Error forwarding request to internal service");
    }
}

// Main Gateway Middleware
export async function gatewayMiddleware(req: Request, res: Response) {
    try {
        // Step 1: Extract and validate credentials
        const clientId = req.header("x-client-id");
        const signature = req.header("x-signature");

        if (process.env.NODE_ENV === "development") {
            logger.debug(
                { clientId, signature, url: req.originalUrl, method: req.method },
                "Gateway: Incoming request"
            );
        }

        const credentialCheck = validateClientCredentials(clientId, signature);
        if (!credentialCheck.valid) {
            return sendError(res, credentialCheck.error || "Unauthorized", 401);
        }

        // Step 2: Verify signature and load client app
        const payload = `${req.method}:${req.originalUrl}`;
        const signatureCheck = await verifyClientSignature(clientId!, signature!, payload);

        if (process.env.NODE_ENV === "development") {
            logger.debug({ foundApp: signatureCheck.app }, "Gateway: Loaded client app with permissions");
            logger.debug({ payload, isValid: signatureCheck.verified, secret: signatureCheck.app?.secret }, "Gateway: Signature verification");
        }

        if (!signatureCheck.verified) {
            return sendError(res, signatureCheck.error || "Unauthorized", 401);
        }

        // Step 3: Find matching permission
        const matched = findMatchingPermission(req, signatureCheck.app?.permissions || []);

        if (!matched) {
            if (process.env.NODE_ENV === "development") {
                logger.debug("Gateway: No matching permission found");
            }
            return res.status(403).json({ message: "Forbidden" });
        }

        const { permission, params } = matched;

        // Step 4: Build internal URL
        req.params = Object.assign(
            {},
            req.params,
            ...Object.entries(params).map(([k, v]) => ({
                [k]: Array.isArray(v) ? v.join(",") : String(v)
            }))
        );

        const internalPath = buildInternalPath(permission.internalPath, params);
        const query = getQueryString(req.url);
        const forwardUrl = query ? `${internalPath}?${query}` : internalPath;

        const serviceBaseUrl = permission.service?.baseUrl;
        if (!serviceBaseUrl) {
            if (process.env.NODE_ENV === "development") {
                logger.debug("Gateway: Missing service baseUrl");
            }
            return sendError(res, "Internal Server Error: Missing service configuration", 500);
        }

        const targetUrl = `${serviceBaseUrl}${forwardUrl}`;

        if (process.env.NODE_ENV === "development") {
            logger.debug({ internalPath, forwardUrl, targetUrl }, "Gateway: Proxying to internal service");
        }

        // Step 5: Proxy request to internal service
        const proxyResponse = await proxyRequestToInternalService(req, targetUrl);
        return res.status(proxyResponse.status).json(proxyResponse.data);

    } catch (error) {
        logger.error({ error }, "Error in gateway middleware");
        res.status(500).json({ error: "Internal Server Error" });
    }
}
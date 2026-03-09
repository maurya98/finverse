import { sendError } from "@finverse/utils";
import { logger } from "@finverse/logger";
import { Request, Response } from "express";
import { ClientAppService, RouteService } from "../services";
import { verifySignature } from "../../utils/verifySignature.util";
import { compilePath, extractParams } from "../../utils/matchPath.util";
import type { IncomingHttpHeaders } from "http";
import type { HttpMethod } from "../../databases/generated/prisma";

/**
 * Gateway Middleware
 * 
 * Handles client authentication and request proxying to internal services.
 * 
 * Environment Variables:
 * - DISABLE_GATEWAY_CREDENTIALS: Set to "true" to disable all authentication.
 *   When enabled, the gateway works as a simple redirection service:
 *   - No x-client-id or x-signature required
 *   - Searches all routes in the database for matching path and method
 *   - Proxies request to the matched route's internal service
 *   - All headers, body, query strings are preserved
 */

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

// Route Matching (for redirection mode without client permissions)
type RouteWithService = {
    id: string;
    serviceId: string;
    name: string;
    description: string | null;
    exposedPath: string;
    actualPath: string;
    method: HttpMethod;
    isActive: boolean;
    createdAt: Date;
    service: {
        id: string;
        name: string;
        description: string | null;
        baseUrl: string;
        isActive: boolean;
        createdAt: Date;
    };
};

interface MatchedRoute {
    route: RouteWithService;
    params: Record<string, string>;
}

function matchRouteToRequest(
    req: Request,
    route: RouteWithService
): MatchedRoute | null {
    // Skip if path is not defined
    if (!route.exposedPath) return null;

    // Check method mismatch
    if (route.method && route.method !== req.method) {
        if (process.env.NODE_ENV === "development") {
            logger.debug({ 
                routeMethod: route.method, 
                reqMethod: req.method,
                routePath: route.exposedPath 
            }, "Gateway: Method mismatch");
        }
        return null;
    }

    // Try to match path
    const pathOnly = getPathOnly(req.originalUrl);
    const compiledPath = compilePath(route.exposedPath);
    const params = extractParams(compiledPath, pathOnly);

    if (process.env.NODE_ENV === "development") {
        logger.debug({ 
            routeExposedPath: route.exposedPath,
            requestPath: pathOnly,
            requestFullUrl: req.originalUrl,
            params,
            matched: !!params
        }, "Gateway: Path matching attempt");
    }

    return params ? { route, params } : null;
}

function findMatchingRoute(
    req: Request,
    routes: RouteWithService[]
): MatchedRoute | null {
    if (process.env.NODE_ENV === "development") {
        logger.debug({ 
            requestUrl: req.originalUrl,
            requestMethod: req.method,
            availableRoutes: routes.length
        }, "Gateway: Starting route matching");
    }

    for (const route of routes) {
        const matched = matchRouteToRequest(req, route);
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
        // Check if credential validation is disabled
        const disableCredentials = process.env.DISABLE_GATEWAY_CREDENTIALS === "true";
        
        if (process.env.NODE_ENV === "development") {
            logger.debug(
                { url: req.originalUrl, method: req.method, disableCredentials },
                "Gateway: Incoming request"
            );
        }

        if (disableCredentials) {
            // ===== REDIRECTION MODE =====
            // Gateway works as a simple redirection service
            // No authentication, just match route and proxy
            
            try {
                // Get all routes from database
                const allRoutes = await RouteService.getInstance().getAllRoutesWithService();
                
                if (process.env.NODE_ENV === "development") {
                    logger.debug({ 
                        totalRoutes: allRoutes?.length || 0,
                        rawRoutes: (allRoutes || []).map(r => ({
                            id: r.id,
                            exposedPath: r.exposedPath,
                            actualPath: r.actualPath,
                            method: r.method,
                            routeActive: r.isActive,
                            hasService: !!r.service,
                            serviceActive: r.service?.isActive,
                            serviceName: r.service?.name,
                            serviceBaseUrl: r.service?.baseUrl
                        }))
                    }, "Gateway: Raw routes loaded from database");
                }
                
                // Filter for active routes with active services
                const activeRoutes = (allRoutes || []).filter(
                    (route): route is RouteWithService => {
                        const isRouteActive = route.isActive === true;
                        const hasService = route.service !== null && route.service !== undefined;
                        const isServiceActive = hasService && route.service.isActive === true;
                        
                        if (process.env.NODE_ENV === "development" && (!isRouteActive || !isServiceActive)) {
                            logger.debug({
                                routeId: route.id,
                                routePath: route.exposedPath,
                                method: route.method,
                                isRouteActive,
                                hasService,
                                isServiceActive,
                                serviceName: route.service?.name
                            }, "Gateway: Route filtered out");
                        }
                        
                        return isRouteActive && hasService && isServiceActive;
                    }
                );

                if (process.env.NODE_ENV === "development") {
                    logger.debug({ 
                        totalRoutes: allRoutes?.length || 0,
                        activeRoutesWithService: activeRoutes.length,
                        routes: activeRoutes.map(r => ({
                            exposedPath: r.exposedPath,
                            method: r.method,
                            hasService: !!r.service
                        }))
                    }, "Gateway: Loaded all routes (redirection mode)");
                }

                // Find matching route
                const matched = findMatchingRoute(req, activeRoutes);

                if (!matched) {
                    if (process.env.NODE_ENV === "development") {
                        logger.debug({ 
                            requestUrl: req.originalUrl,
                            requestMethod: req.method,
                            availableRoutesCount: activeRoutes.length
                        }, "Gateway: No matching route found");
                    }
                    return res.status(404).json({ 
                        message: "Not Found: No route configured for this path and method" 
                    });
                }

                const { route, params } = matched;

                // Build internal URL
                req.params = Object.assign(
                    {},
                    req.params,
                    ...Object.entries(params).map(([k, v]) => ({
                        [k]: Array.isArray(v) ? v.join(",") : String(v)
                    }))
                );

                const internalPath = buildInternalPath(route.actualPath, params);
                const query = getQueryString(req.url);
                const forwardUrl = query ? `${internalPath}?${query}` : internalPath;

                const serviceBaseUrl = route.service?.baseUrl;
                if (!serviceBaseUrl) {
                    if (process.env.NODE_ENV === "development") {
                        logger.debug("Gateway: Missing service baseUrl");
                    }
                    return sendError(res, "Internal Server Error: Missing service configuration", 500);
                }

                const targetUrl = `${serviceBaseUrl}${forwardUrl}`;

                if (process.env.NODE_ENV === "development") {
                    logger.debug({ 
                        requestPath: req.originalUrl,
                        exposedPath: route.exposedPath,
                        actualPath: route.actualPath,
                        internalPath, 
                        forwardUrl, 
                        targetUrl 
                    }, "Gateway: Proxying to internal service (redirection mode)");
                }

                // Proxy request to internal service
                const proxyResponse = await proxyRequestToInternalService(req, targetUrl);
                return res.status(proxyResponse.status).json(proxyResponse.data);

            } catch (error) {
                logger.error({ error }, "Gateway: Error in redirection mode");
                return res.status(500).json({ error: "Internal Server Error" });
            }
        }

        // ===== AUTHENTICATION MODE =====
        // Standard gateway with client authentication
        
        const clientId = req.header("x-client-id");
        const signature = req.header("x-signature");

        if (process.env.NODE_ENV === "development") {
            logger.debug(
                { clientId, signature },
                "Gateway: Authenticating request"
            );
        }

        // Validate credentials
        const credentialCheck = validateClientCredentials(clientId, signature);
        if (!credentialCheck.valid) {
            return sendError(res, credentialCheck.error || "Unauthorized", 401);
        }

        // Verify signature and load client app
        const payload = `${req.method}:${req.originalUrl}`;
        const signatureCheck = await verifyClientSignature(clientId!, signature!, payload);

        if (process.env.NODE_ENV === "development") {
            logger.debug({ foundApp: signatureCheck.app }, "Gateway: Loaded client app with permissions");
            logger.debug({ payload, isValid: signatureCheck.verified, secret: signatureCheck.app?.secret }, "Gateway: Signature verification");
        }

        if (!signatureCheck.verified) {
            return sendError(res, signatureCheck.error || "Unauthorized", 401);
        }

        const clientApp = signatureCheck.app;

        // Find matching permission
        const matched = findMatchingPermission(req, clientApp?.permissions || []);

        if (!matched) {
            if (process.env.NODE_ENV === "development") {
                logger.debug({ 
                    clientId, 
                    permissionsCount: clientApp?.permissions?.length,
                    requestUrl: req.originalUrl,
                    requestMethod: req.method
                }, "Gateway: No matching permission found");
            }
            return res.status(403).json({ message: "Forbidden" });
        }

        const { permission, params } = matched;

        // Build internal URL
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

        // Proxy request to internal service
        const proxyResponse = await proxyRequestToInternalService(req, targetUrl);
        return res.status(proxyResponse.status).json(proxyResponse.data);

    } catch (error) {
        logger.error({ error }, "Error in gateway middleware");
        res.status(500).json({ error: "Internal Server Error" });
    }
}
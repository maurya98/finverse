import { Request, Response, NextFunction } from "express";
import { logger } from "@finverse/logger";

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordconfirm",
  "currentpassword",
  "newpassword",
  "token",
  "accesstoken",
  "refreshtoken",
  "apikey",
  "api_key",
  "secret",
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "x-auth-token",
  "creditcard",
  "credit_card",
  "cvv",
  "ssn",
  "pin",
]);

const PERSONAL_KEYS = new Set([
  "email",
  "phone",
  "phonenumber",
  "mobile",
  "address",
  "street",
  "city",
  "zip",
  "zipcode",
  "dob",
  "dateofbirth",
]);

const REDACTED = "[REDACTED]";
const VISIBLE_CHARS = 2;
const MASK_CHAR = "*";

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.has(key.toLowerCase().replace(/[-_\s]/g, ""));
}

function isPersonalKey(key: string): boolean {
  return PERSONAL_KEYS.has(key.toLowerCase().replace(/[-_\s]/g, ""));
}

function fullyMask(_value: unknown): string {
  return REDACTED;
}

function partiallyMask(value: string): string {
  if (typeof value !== "string" || value.length <= VISIBLE_CHARS * 2) {
    return value.length > 0 ? MASK_CHAR.repeat(Math.min(value.length, 4)) : "";
  }
  const start = value.slice(0, VISIBLE_CHARS);
  const end = value.slice(-VISIBLE_CHARS);
  const maskedLength = Math.max(0, value.length - VISIBLE_CHARS * 2);
  return `${start}${MASK_CHAR.repeat(Math.min(maskedLength, 8))}${end}`;
}

function maskValue(key: string, value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (isSensitiveKey(key)) return fullyMask(value);
  if (isPersonalKey(key) && typeof value === "string") return partiallyMask(value);
  return value;
}

function maskObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => (typeof item === "object" && item !== null && !Array.isArray(item) ? maskObject(item) : item));
  }

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      out[k] = maskObject(v);
    } else {
      out[k] = maskValue(k, v);
    }
  }
  return out;
}

/** JSON.stringify that replaces circular references with "[Circular]" */
function safeStringify(value: unknown): string {
  const seen = new WeakSet();
  return JSON.stringify(value, (_, val) => {
    if (val !== null && typeof val === "object") {
      if (seen.has(val)) return "[Circular]";
      seen.add(val);
    }
    return val;
  });
}

/** Safe copy of headers to avoid circular refs; masks sensitive headers */
function safeHeaders(headers: Record<string, string | string[] | undefined>): Record<string, string | string[]> {
  const safe = Object.fromEntries(
    Object.entries(headers).filter(
      (entry): entry is [string, string | string[]] =>
        typeof entry[1] === "string" || (Array.isArray(entry[1]) && entry[1].every((v) => typeof v === "string"))
    )
  );
  return maskObject(safe) as Record<string, string | string[]>;
}

export interface RequestLoggerOptions {
  /** Application name to include in logs (e.g. "ruleenginebe", "auth-service") */
  appName?: string;
}

export function requestLoggerMiddleware(options?: RequestLoggerOptions): (req: Request, res: Response, next: NextFunction) => void {
  const appName = options?.appName;

  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    let responseBody: unknown;

    const originalJson = res.json.bind(res);
    res.json = function (body: unknown) {
      responseBody = body;
      return originalJson(body);
    };

    const originalSend = res.send.bind(res);
    res.send = function (body?: unknown) {
      if (responseBody === undefined) responseBody = body;
      return originalSend(body as never);
    };

    const requestPayload = (() => {
      try {
        return {
          ...(appName && { application: appName }),
          method: req.method,
          url: req.url,
          headers: safeHeaders(req.headers as Record<string, string | string[] | undefined>),
          body: maskObject(req.body),
          query: maskObject(req.query),
          params: maskObject(req.params),
        };
      } catch (error) {
        logger.error(`Error building request log: ${error}`);
        return null;
      }
    })();

    res.on("finish", () => {
      try {
        const durationMs = Date.now() - startTime;
        const logPayload = {
          ...requestPayload,
          statusCode: res.statusCode,
          ...(responseBody !== undefined && { responseBody }),
          durationMs,
          timestamp: new Date().toISOString(),
        };
        if (logPayload.method === "POST" || logPayload.method === "PUT" || logPayload.method === "PATCH" || logPayload.method === "DELETE") {
          logger.info(safeStringify(logPayload));
        } else {
          logger.info(logPayload);
        }
        try {
          const { pushLogToPg } = require("./pg-writer");
          pushLogToPg(logPayload);
        } catch (error: unknown) {
          logger.error("Error pushing log to Postgres");
        }
      } catch (error) {
        logger.error(`Error logging request/response: ${error}`);
      }
    });

    next();
  };
}
import { Request, Response, NextFunction } from "express";
import { logger } from "@finverse/logger";
import { sendError } from "@finverse/utils";

export interface HttpError extends Error {
  statusCode?: number;
  status?: number;
  isOperational?: boolean;
  errors?: Array<{ path?: string; message: string }>;
}

const isHttpError = (err: unknown): err is HttpError =>
  err instanceof Error &&
  (typeof (err as HttpError).statusCode === "number" ||
    typeof (err as HttpError).status === "number");

/**
 * Central error handler middleware. Must be registered after all routes.
 * Uses the 4-argument signature (err, req, res, next) so Express treats it as an error handler.
 * Responses use the standard shape from @finverse/validator (success: false, message, errors?).
 */
export function errorHandlerMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isDev = process.env.NODE_ENV !== "production";

  const statusCode = isHttpError(err) ? (err.statusCode ?? err.status ?? 500) : 500;
  const message =
    err instanceof Error ? err.message : "An unexpected error occurred";
  const errors = isHttpError(err) ? err.errors : undefined;

  if (statusCode >= 500) {
    logger.error(
      { err: err instanceof Error ? err : String(err), statusCode },
      message
    );
  } else if (isDev) {
    logger.warn({ statusCode }, message);
  }

  if (!res.headersSent) {
    sendError(res, message, statusCode, errors);
  }
}

export default errorHandlerMiddleware;

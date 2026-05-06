import type { NextFunction, Request, Response } from "express";
import { logger } from "@finverse/logger";
import { AppError } from "../errors";
import { config } from "../config";

const errorLogger = logger.child({ middleware: "error", app: "chat" });

export function errorMiddleware(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  const appError = normalizeError(error);

  if (config.logging.errors) {
    const logMethod = appError.httpStatus >= 500 ? "error" : "warn";
    errorLogger[logMethod](
      {
        code: appError.code,
        reason: appError.reason,
        details: appError.details ?? null,
        stack: appError.stack,
      },
      "Request failed"
    );
  }

  return res.status(appError.httpStatus).json({
    success: false,
    code: appError.code,
    message: appError.message,
    reason: appError.reason,
    details: appError.details ?? null,
  });
}

function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof SyntaxError && "body" in error) {
    return new AppError({
      code: "INVALID_JSON",
      message: "Invalid request",
      reason: "Malformed request body or invalid JSON",
      httpStatus: 400,
    });
  }

  if (error instanceof Error) {
    return new AppError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected error",
      reason: error.message || "Unexpected error",
      httpStatus: 500,
      details: { name: error.name },
    });
  }

  return new AppError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Unexpected error",
    reason: "Unexpected error",
    httpStatus: 500,
  });
}

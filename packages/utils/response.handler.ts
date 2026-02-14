import type { Response } from "express";

/**
 * Standard success response shape.
 * Use for all successful API responses.
 */
export interface SuccessResponseBody<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

/**
 * Standard error response shape.
 * Use for all error API responses (4xx, 5xx).
 */
export interface ErrorResponseBody {
  success: false;
  message: string;
  errors?: Array<{ path?: string; message: string }>;
}

/**
 * Union of standard API response bodies.
 */
export type ApiResponseBody<T = unknown> = SuccessResponseBody<T> | ErrorResponseBody;

/**
 * Sends a standard success response.
 *
 * @param res - Express response object
 * @param data - Optional payload (omitted when only message is needed)
 * @param status - HTTP status code (default 200)
 * @param message - Optional human-readable message
 * @returns The Express response for chaining
 *
 * @example
 * sendSuccess(res, { user, token });
 * sendSuccess(res, undefined, 201, "Created");
 */
export function sendSuccess<T>(
  res: Response,
  data?: T,
  status = 200,
  message?: string
): Response {
  const body: SuccessResponseBody<T> = { success: true };
  if (data !== undefined) body.data = data;
  if (message !== undefined) body.message = message;
  return res.status(status).json(body);
}

/**
 * Sends a standard error response.
 *
 * @param res - Express response object
 * @param message - Error message
 * @param status - HTTP status code (default 500)
 * @param errors - Optional list of field/validation errors
 * @returns The Express response for chaining
 *
 * @example
 * sendError(res, "Invalid email or password", 401);
 * sendError(res, "Validation failed", 400, [{ path: "email", message: "Invalid email" }]);
 */
export function sendError(
  res: Response,
  message: string,
  status = 500,
  errors?: Array<{ path?: string; message: string }>
): Response {
  const body: ErrorResponseBody = { success: false, message };
  if (errors !== undefined && errors.length > 0) body.errors = errors;
  return res.status(status).json(body);
}

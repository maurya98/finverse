import type { Request, Response, NextFunction } from "express";
import type { ZodSchema, ZodError } from "zod";
import { sendError } from "./response.handler";

/**
 * Result of validating a request payload.
 * - On success: `ok: true` and typed `data`.
 * - On failure: `ok: false` and list of `errors` with path and message.
 */
export type ValidationResult<T> = | { ok: true; data: T } | { ok: false; errors: ValidationError[] };

export type ValidationError = {
  path: string;
  message: string;
};

/**
 * Validates a payload against a Zod schema.
 *
 * @param schema - Zod schema to validate against
 * @param payload - Unknown payload (e.g. req.body)
 * @returns ValidationResult with typed data on success or errors on failure
 *
 * @example
 * const bodySchema = z.object({ email: z.string().email(), password: z.string().min(8) });
 * const result = validatePayload(bodySchema, req.body);
 * if (result.ok) {
 *   const { email, password } = result.data;
 * } else {
 *   res.status(400).json({ errors: result.errors });
 * }
 */
export function validatePayload<T>(schema: ZodSchema<T>,payload: unknown): ValidationResult<T> {
  const parsed = schema.safeParse(payload);

  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }

  const zodError = parsed.error as ZodError;
  const errors: ValidationError[] = zodError.issues.map((e: { path: any[]; message: any; }) => ({
    path: e.path.length > 0 ? e.path.join(".") : "body",
    message: e.message,
  }));

  return { ok: false, errors };
}

/**
 * Express middleware factory that validates req.body against a Zod schema.
 * On success: assigns parsed data to req.body and calls next().
 * On failure: responds with 400 and JSON `{ message, errors }` and does not call next().
 *
 * @param schema - Zod schema for the request body
 * @returns Express middleware
 *
 * @example
 * router.post("/login", validateBody(loginBodySchema), (req, res) => {
 *   const { email, password } = req.body; // typed and validated
 * });
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = validatePayload(schema, req.body);

    if (result.ok) {
      (req as Request & { body: T }).body = result.data;
      next();
      return;
    }

    sendError(res, "Validation failed", 400, result.errors);
  };
}

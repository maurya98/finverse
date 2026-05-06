import { AppError } from "./app-error";

export class InvalidRequestError extends AppError {
  constructor(reason = "Malformed request body or invalid JSON") {
    super({
      code: "INVALID_REQUEST",
      message: "Invalid request",
      reason,
      httpStatus: 400,
    });
  }
}

export class ValidationFailedError extends AppError {
  constructor(details?: Record<string, unknown>) {
    super({
      code: "VALIDATION_FAILED",
      message: "Validation failed",
      reason: "Input data does not match required schema",
      httpStatus: 422,
      details,
    });
  }
}

export class MissingFieldError extends AppError {
  constructor(field: string) {
    super({
      code: "MISSING_REQUIRED_FIELD",
      message: `${field} is required`,
      reason: `Missing required field: ${field}`,
      httpStatus: 400,
    });
  }
}

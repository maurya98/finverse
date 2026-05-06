import { AppError } from "./app-error";

export class AuthRequiredError extends AppError {
  constructor() {
    super({
      code: "AUTH_REQUIRED",
      message: "Authentication required",
      reason: "No authentication token provided",
      httpStatus: 401,
    });
  }
}

export class InvalidTokenError extends AppError {
  constructor() {
    super({
      code: "INVALID_TOKEN",
      message: "Invalid token",
      reason: "Token is malformed or signature verification failed",
      httpStatus: 401,
    });
  }
}

export class TokenExpiredError extends AppError {
  constructor() {
    super({
      code: "TOKEN_EXPIRED",
      message: "Token expired",
      reason: "Authentication token has expired",
      httpStatus: 401,
    });
  }
}

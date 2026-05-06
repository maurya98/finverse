import { AppError, ErrorDetails } from "./app-error";

export class DatabaseError extends AppError {
  constructor(reason = "Unexpected database error", details?: ErrorDetails) {
    super({
      code: "DB_ERROR",
      message: "Database error",
      reason,
      httpStatus: 500,
      details,
    });
  }
}

export class DBConnectionError extends AppError {
  constructor() {
    super({
      code: "DB_CONNECTION_FAILED",
      message: "Database connection failed",
      reason: "Unable to connect to Postgres",
      httpStatus: 500,
    });
  }
}

export class DBConstraintError extends AppError {
  constructor(constraint: string) {
    super({
      code: "DB_CONSTRAINT_VIOLATION",
      message: "Constraint violation",
      reason: `Database constraint violated: ${constraint}`,
      httpStatus: 409,
    });
  }
}

export class DBTimeoutError extends AppError {
  constructor() {
    super({
      code: "DB_TIMEOUT",
      message: "Database timeout",
      reason: "Query execution exceeded time limit",
      httpStatus: 504,
    });
  }
}

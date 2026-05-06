import { AppError } from "./app-error";

export class CacheError extends AppError {
  constructor(reason = "Cache operation failed") {
    super({
      code: "CACHE_ERROR",
      message: "Cache error",
      reason,
      httpStatus: 500,
    });
  }
}

export class CacheConnectionError extends AppError {
  constructor() {
    super({
      code: "CACHE_CONNECTION_FAILED",
      message: "Cache connection failed",
      reason: "Unable to connect to Redis",
      httpStatus: 500,
    });
  }
}

import { AppError } from "./app-error";

export class UpstreamError extends AppError {
  constructor(reason = "External service failed") {
    super({
      code: "UPSTREAM_ERROR",
      message: "Upstream service error",
      reason,
      httpStatus: 502,
    });
  }
}

export class UpstreamTimeoutError extends AppError {
  constructor() {
    super({
      code: "UPSTREAM_TIMEOUT",
      message: "Upstream timeout",
      reason: "External service did not respond in time",
      httpStatus: 504,
    });
  }
}

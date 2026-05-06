import type { ErrorDetails } from "../types/common";

export type { ErrorDetails };

export class AppError extends Error {
  public readonly code: string;
  public readonly httpStatus: number;
  public readonly reason: string;
  public readonly details?: ErrorDetails;

  constructor(params: {
    code: string;
    message: string;
    reason: string;
    httpStatus: number;
    details?: ErrorDetails;
  }) {
    super(params.message);

    this.code = params.code;
    this.httpStatus = params.httpStatus;
    this.reason = params.reason;
    this.details = params.details;

    Error.captureStackTrace(this, this.constructor);
  }
}

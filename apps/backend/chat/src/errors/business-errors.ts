import { AppError } from "./app-error";

export class BusinessRuleError extends AppError {
  constructor(reason: string) {
    super({
      code: "BUSINESS_RULE_VIOLATION",
      message: "Business rule violated",
      reason,
      httpStatus: 400,
    });
  }
}

export class InvalidStateError extends AppError {
  constructor(reason: string) {
    super({
      code: "INVALID_STATE",
      message: "Invalid state",
      reason,
      httpStatus: 409,
    });
  }
}

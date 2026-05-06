import { AppError } from "./app-error";

export class ForbiddenError extends AppError {
  constructor(reason = "User does not have permission") {
    super({
      code: "FORBIDDEN",
      message: "Forbidden",
      reason,
      httpStatus: 403,
    });
  }
}

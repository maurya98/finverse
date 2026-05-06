import { AppError } from "./app-error";

export class ConflictError extends AppError {
  constructor(reason = "Resource conflict occurred") {
    super({
      code: "CONFLICT",
      message: "Conflict",
      reason,
      httpStatus: 409,
    });
  }
}

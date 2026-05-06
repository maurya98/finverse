import { AppError } from "./app-error";

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super({
      code: "RESOURCE_NOT_FOUND",
      message: `${resource} not found`,
      reason: `${resource} does not exist`,
      httpStatus: 404,
    });
  }
}

export class AlreadyExistsError extends AppError {
  constructor(resource = "Resource") {
    super({
      code: "RESOURCE_ALREADY_EXISTS",
      message: `${resource} already exists`,
      reason: `Duplicate ${resource.toLowerCase()} detected`,
      httpStatus: 409,
    });
  }
}

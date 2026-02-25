import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { errorHandlerMiddleware, type HttpError } from "../src/error-handler.middleware";
import type { Request, Response, NextFunction } from "express";

vi.mock("@finverse/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("@finverse/utils", () => ({
  sendError: vi.fn().mockReturnValue({}),
}));

import * as utils from "@finverse/utils";
const sendError = vi.mocked(utils.sendError);

function createMockRes(): Response {
  return {
    headersSent: false,
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

describe("errorHandlerMiddleware", () => {
  const req = {} as Request;
  const next = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  it("calls sendError with 500 and message for generic Error", () => {
    const res = createMockRes();
    const err = new Error("Something broke");
    errorHandlerMiddleware(err, req, res, next);
    expect(sendError).toHaveBeenCalledWith(res, "Something broke", 500, undefined);
  });

  it("uses statusCode from HttpError when present", () => {
    const res = createMockRes();
    const err = new Error("Bad request") as HttpError;
    err.statusCode = 400;
    errorHandlerMiddleware(err, req, res, next);
    expect(sendError).toHaveBeenCalledWith(res, "Bad request", 400, undefined);
  });

  it("falls back to status when statusCode not set on HttpError", () => {
    const res = createMockRes();
    const err = new Error("Unauthorized") as HttpError;
    err.status = 401;
    errorHandlerMiddleware(err, req, res, next);
    expect(sendError).toHaveBeenCalledWith(res, "Unauthorized", 401, undefined);
  });

  it("passes errors array from HttpError to sendError", () => {
    const res = createMockRes();
    const err = new Error("Validation failed") as HttpError;
    err.statusCode = 400;
    err.errors = [{ path: "email", message: "Invalid email" }];
    errorHandlerMiddleware(err, req, res, next);
    expect(sendError).toHaveBeenCalledWith(res, "Validation failed", 400, err.errors);
  });

  it("uses default message for non-Error thrown value", () => {
    const res = createMockRes();
    errorHandlerMiddleware("string error", req, res, next);
    expect(sendError).toHaveBeenCalledWith(res, "An unexpected error occurred", 500, undefined);
  });

  it("does not call sendError when headers already sent", () => {
    const res = createMockRes();
    res.headersSent = true;
    errorHandlerMiddleware(new Error("Too late"), req, res, next);
    expect(sendError).not.toHaveBeenCalled();
  });
});

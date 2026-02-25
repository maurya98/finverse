import { describe, it, expect, vi, beforeEach } from "vitest";
import { requestLoggerMiddleware } from "../src/request-logger/request.logger.middleware";
import { logger } from "@finverse/logger";
import type { Request, Response, NextFunction } from "express";

vi.mock("@finverse/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("../src/request-logger/pg-writer", () => ({
  pushLogToPg: vi.fn(),
}));

function createMockRes(): Response {
  const res = {
    statusCode: 200,
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
    getHeader: vi.fn(),
    on: vi.fn((event: string, fn: () => void) => {
      if (event === "finish") (res as { _onFinish?: () => void })._onFinish = fn;
      return res;
    }),
  } as unknown as Response & { _onFinish?: () => void };
  return res;
}

describe("requestLoggerMiddleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a middleware function", () => {
    const mw = requestLoggerMiddleware();
    expect(typeof mw).toBe("function");
    expect(mw.length).toBe(3);
  });

  it("calls next() immediately", () => {
    const mw = requestLoggerMiddleware();
    const req = { method: "GET", url: "/", headers: {}, body: {}, query: {}, params: {} } as Request;
    const res = createMockRes();
    const next = vi.fn();
    mw(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("wraps res.json and captures response body", () => {
    const originalJson = vi.fn().mockReturnThis();
    const res = createMockRes();
    (res as { json: ReturnType<typeof vi.fn> }).json = originalJson;
    const mw = requestLoggerMiddleware();
    const req = { method: "POST", url: "/api", headers: {}, body: {}, query: {}, params: {} } as Request;
    const next = vi.fn();
    mw(req, res, next);
    expect(next).toHaveBeenCalled();
    res.json({ id: 1, name: "test" });
    expect(originalJson).toHaveBeenCalledWith({ id: 1, name: "test" });
    const onFinish = (res as { _onFinish?: () => void })._onFinish;
    expect(onFinish).toBeDefined();
    if (onFinish) onFinish();
    expect(vi.mocked(logger.info)).toHaveBeenCalled();
  });

  it("includes appName in options when provided", () => {
    const mw = requestLoggerMiddleware({ appName: "test-app" });
    const req = { method: "GET", url: "/", headers: {}, body: {}, query: {}, params: {} } as Request;
    const res = createMockRes();
    const next = vi.fn();
    mw(req, res, next);
    expect(next).toHaveBeenCalled();
    const onFinish = (res as { _onFinish?: () => void })._onFinish;
    if (onFinish) onFinish();
    expect(vi.mocked(logger.info)).toHaveBeenCalledWith(
      expect.objectContaining({
        application: "test-app",
      })
    );
  });
});

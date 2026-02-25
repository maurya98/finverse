import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { securityMiddleware } from "../src/security.middleware";
import type { Request, Response, NextFunction } from "express";

// securityMiddleware = [cors, helmet, securityHeaders, contentTypeProtection, requestSizeLimit, parameterPollutionProtection]
// Indices 2–5 are our custom middlewares
const securityHeaders = securityMiddleware[2] as (req: Request, res: Response, next: NextFunction) => void;
const contentTypeProtection = securityMiddleware[3] as (req: Request, res: Response, next: NextFunction) => void;
const requestSizeLimit = securityMiddleware[4] as (req: Request, res: Response, next: NextFunction) => void;
const parameterPollutionProtection = securityMiddleware[5] as (req: Request, res: Response, next: NextFunction) => void;

function createMockRes(): Response {
  return {
    setHeader: vi.fn().mockReturnThis(),
    removeHeader: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

describe("securityHeaders", () => {
  const req = {} as Request;
  const next = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  it("sets X-Frame-Options, X-Content-Type-Options, X-XSS-Protection", () => {
    const res = createMockRes();
    securityHeaders(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith("X-Frame-Options", "DENY");
    expect(res.setHeader).toHaveBeenCalledWith("X-Content-Type-Options", "nosniff");
    expect(res.setHeader).toHaveBeenCalledWith("X-XSS-Protection", "1; mode=block");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("removes X-Powered-By header", () => {
    const res = createMockRes();
    securityHeaders(req, res, next);
    expect(res.removeHeader).toHaveBeenCalledWith("X-Powered-By");
    expect(res.removeHeader).toHaveBeenCalledWith("x-powered-by");
  });

  it("sets Strict-Transport-Security in production", () => {
    process.env.NODE_ENV = "production";
    const res = createMockRes();
    securityHeaders(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  });
});

describe("contentTypeProtection", () => {
  const next = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls next() for GET (no content-type check)", () => {
    const req = { method: "GET" } as Request;
    const res = createMockRes();
    contentTypeProtection(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("allows application/json for POST", () => {
    const req = { method: "POST", headers: { "content-type": "application/json" } } as Request;
    const res = createMockRes();
    contentTypeProtection(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 415 for disallowed content-type on POST", () => {
    const req = { method: "POST", headers: { "content-type": "application/unknown" } } as Request;
    const res = createMockRes();
    contentTypeProtection(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(415);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("Unsupported Media Type"),
      })
    );
  });
});

describe("requestSizeLimit", () => {
  const next = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls next() when content-length is within limit", () => {
    const req = { headers: { "content-length": "1000" } } as Request;
    const res = createMockRes();
    requestSizeLimit(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("calls next() when content-length is absent", () => {
    const req = { headers: {} } as Request;
    const res = createMockRes();
    requestSizeLimit(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("returns 413 when content-length exceeds limit", () => {
    const maxSize = 500 * 1024 * 1024;
    const req = { headers: { "content-length": String(maxSize + 1) } } as Request;
    const res = createMockRes();
    requestSizeLimit(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("Payload too large"),
      })
    );
  });
});

describe("parameterPollutionProtection", () => {
  const next = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls next() when no query params", () => {
    const req = { query: {} } as Request;
    const res = createMockRes();
    parameterPollutionProtection(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("calls next() when query keys are unique", () => {
    const req = { query: { a: "1", b: "2" } } as Request;
    const res = createMockRes();
    parameterPollutionProtection(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

});

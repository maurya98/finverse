import { describe, it, expect } from "vitest";
import { compressionMiddleware } from "../src/compression.middleware";
import type { Request, Response } from "express";

describe("compressionMiddleware", () => {
  it("is a function (Express RequestHandler)", () => {
    expect(typeof compressionMiddleware).toBe("function");
    expect(compressionMiddleware.length).toBeGreaterThanOrEqual(2); // (req, res, next) or (req, res)
  });

  it("can be invoked without throwing", () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = () => {};
    expect(() => compressionMiddleware(req, res, next)).not.toThrow();
  });
});

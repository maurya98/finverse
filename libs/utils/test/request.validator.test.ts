import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { validatePayload, validateBody } from "../src/request.validator";
import type { Request, Response, NextFunction } from "express";

describe("validatePayload", () => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  it("returns ok: true and typed data when payload is valid", () => {
    const payload = { email: "a@b.com", password: "password1" };
    const result = validatePayload(schema, payload);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual(payload);
      expect(result.data.email).toBe("a@b.com");
      expect(result.data.password).toBe("password1");
    }
  });

  it("returns ok: false and errors when payload is invalid", () => {
    const payload = { email: "invalid", password: "short" };
    const result = validatePayload(schema, payload);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.every((e) => e.path !== undefined && e.message !== undefined)).toBe(true);
    }
  });

  it("uses 'body' as path when Zod path is empty", () => {
    const emptySchema = z.string();
    const result = validatePayload(emptySchema, 123);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const bodyError = result.errors.find((e) => e.path === "body");
      expect(bodyError).toBeDefined();
    }
  });

  it("rejects unknown/non-object payload for object schema", () => {
    const result = validatePayload(schema, "not an object");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });
});

describe("validateBody", () => {
  const schema = z.object({ name: z.string().min(1) });

  it("assigns parsed body and calls next() when validation succeeds", () => {
    const req = { body: { name: "Alice" } } as Request;
    const res = {} as Response;
    const next = vi.fn();
    const middleware = validateBody(schema);
    middleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect((req as Request & { body: { name: string } }).body).toEqual({ name: "Alice" });
  });

  it("calls sendError and does not call next() when validation fails", () => {
    const req = { body: { name: "" } } as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
    const next = vi.fn();
    const middleware = validateBody(schema);
    middleware(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Validation failed",
        errors: expect.any(Array),
      })
    );
  });
});

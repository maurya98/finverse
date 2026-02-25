import { describe, it, expect, vi } from "vitest";
import { sendSuccess, sendError } from "../src/response.handler";
import type { Response } from "express";

function createMockRes(): Response {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

describe("sendSuccess", () => {
  it("sends 200 with success: true and data when data is provided", () => {
    const res = createMockRes();
    const data = { id: 1, name: "test" };
    sendSuccess(res, data);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data });
  });

  it("sends 200 with success: true only when no data or message", () => {
    const res = createMockRes();
    sendSuccess(res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it("uses custom status and message when provided", () => {
    const res = createMockRes();
    sendSuccess(res, undefined, 201, "Created");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "Created" });
  });

  it("includes both data and message when provided", () => {
    const res = createMockRes();
    sendSuccess(res, { id: 1 }, 200, "OK");
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: 1 },
      message: "OK",
    });
  });

  it("returns the response for chaining", () => {
    const res = createMockRes();
    const result = sendSuccess(res, { x: 1 });
    expect(result).toBe(res);
  });
});

describe("sendError", () => {
  it("sends 500 with success: false and message by default", () => {
    const res = createMockRes();
    sendError(res, "Something went wrong");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Something went wrong",
    });
  });

  it("uses custom status when provided", () => {
    const res = createMockRes();
    sendError(res, "Bad request", 400);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Bad request",
    });
  });

  it("includes errors array when provided", () => {
    const res = createMockRes();
    const errors = [
      { path: "email", message: "Invalid email" },
      { message: "Required" },
    ];
    sendError(res, "Validation failed", 400, errors);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Validation failed",
      errors,
    });
  });

  it("omits errors when empty array", () => {
    const res = createMockRes();
    sendError(res, "Error", 500, []);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error",
    });
  });

  it("omits errors when undefined", () => {
    const res = createMockRes();
    sendError(res, "Error", 500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error",
    });
  });

  it("returns the response for chaining", () => {
    const res = createMockRes();
    const result = sendError(res, "Err", 400);
    expect(result).toBe(res);
  });
});

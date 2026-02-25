import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import { requestLoggerRoutes } from "../src/request-logger/logs.routes";

const mockIsLogDbConfigured = vi.fn();
const mockGetLogsWithCount = vi.fn();
const mockGetLogsAfter = vi.fn();

vi.mock("../src/request-logger/pg-reader", () => ({
  isLogDbConfigured: () => mockIsLogDbConfigured(),
  getLogsAfter: (...args: unknown[]) => mockGetLogsAfter(...args),
  getLogsWithCount: (...args: unknown[]) => mockGetLogsWithCount(...args),
}));

function createApp() {
  const app = express();
  app.use(requestLoggerRoutes());
  return app;
}

describe("requestLoggerRoutes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a Router", () => {
    const router = requestLoggerRoutes();
    expect(router).toBeDefined();
    expect(typeof router).toBe("function");
  });

  describe("GET /", () => {
    it("returns 503 when log DB is not configured", async () => {
      mockIsLogDbConfigured.mockReturnValue(false);
      const app = createApp();
      const res = await request(app).get("/");
      expect(mockIsLogDbConfigured).toHaveBeenCalled();
      expect(res.status).toBe(503);
      expect(res.body).toMatchObject({
        error: "Log database not configured",
        hint: expect.any(String),
      });
    });

    it("returns 200 with data when log DB is configured", async () => {
      mockIsLogDbConfigured.mockReturnValue(true);
      mockGetLogsWithCount.mockResolvedValue({
        rows: [
          {
            id: 1,
            timestamp: "2025-01-01T00:00:00.000Z",
            application: "test-app",
            method: "GET",
            url: "/",
            status_code: 200,
            duration_ms: 10,
            payload_json: {},
          },
        ],
        total: 1,
      });
      const app = createApp();
      const res = await request(app).get("/");
      expect(mockGetLogsWithCount).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        data: [
          expect.objectContaining({
            id: 1,
            application: "test-app",
            method: "GET",
            url: "/",
            status_code: 200,
          }),
        ],
      });
    });

    it("returns 500 when getLogsWithCount rejects", async () => {
      mockIsLogDbConfigured.mockReturnValue(true);
      mockGetLogsWithCount.mockRejectedValue(new Error("DB error"));
      const app = createApp();
      const res = await request(app).get("/");
      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        error: "Failed to fetch logs",
        message: "DB error",
      });
    });
  });

  describe("GET /live", () => {
    it("returns 503 when log DB is not configured", async () => {
      mockIsLogDbConfigured.mockReturnValue(false);
      const app = createApp();
      const res = await request(app).get("/live");
      expect(res.status).toBe(503);
      expect(res.body).toMatchObject({
        error: "Log database not configured",
      });
    });
  });
});

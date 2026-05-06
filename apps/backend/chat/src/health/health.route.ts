import type Redis from "ioredis";
import { Express, Request, Response } from "express";
import { logger } from "@finverse/logger";
import { CacheClient } from "../cache/cache";
import { DatabaseClient } from "../db/db";
import { config } from "../config";
import { CacheConnectionError, DBConnectionError } from "../errors";
import { tryCatch } from "../utils/try-catch";
import type { HealthResponse, HealthStatus } from "../types/health.types";

export class HealthRoute {
  private static redisClient: Redis | null = null;
  private static readonly log = logger.child({ route: "health", app: "chat" });

  public static register(app: Express): void {
    HealthRoute.redisClient = CacheClient.getInstance();
    app.get("/health", HealthRoute.handleHealth);
  }

  private static readonly handleHealth = async (_req: Request, res: Response): Promise<void> => {
    const [error, result] = await tryCatch(() => HealthRoute.getHealthSnapshot());

    if (error || !result) {
      if (config.logging.errors) {
        HealthRoute.log.error({ err: error }, "Health check failed");
      }
      res.status(503).json(HealthRoute.buildHealthErrorResponse(error ?? new DBConnectionError()));
      return;
    }

    res.status(result.ok ? 200 : 503).json({
      ok: result.ok,
      database: HealthRoute.attachHealthMetadata(result.database, new DBConnectionError()),
      cache: HealthRoute.attachHealthMetadata(result.cache, new CacheConnectionError()),
    });
  };

  private static async getHealthSnapshot(): Promise<HealthResponse> {
    if (!HealthRoute.redisClient) {
      if (config.logging.errors) {
        HealthRoute.log.error("Health route requested before cache client initialization");
      }
      throw new CacheConnectionError();
    }

    const database = await DatabaseClient.healthCheck();
    const cache = await CacheClient.healthCheck(HealthRoute.redisClient);

    return {
      database,
      cache,
      ok: database.status === "up" && cache.status === "up",
    };
  }

  private static buildHealthErrorResponse(error: Error): Record<string, unknown> {
    const healthError = error instanceof DBConnectionError ? error : new DBConnectionError();
    if (config.logging.errors) {
      HealthRoute.log.warn({ err: error, code: healthError.code }, "Building health error response");
    }

    return {
      ok: false,
      error: {
        code: healthError.code,
        message: healthError.message,
        reason: healthError.reason,
      },
    };
  }

  private static attachHealthMetadata(
    status: HealthStatus,
    error: DBConnectionError | CacheConnectionError
  ): HealthStatus {
    if (status.status === "up") {
      return status;
    }

    return {
      ...status,
      code: error.code,
      reason: error.reason,
    };
  }
}

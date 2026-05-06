import Redis from "ioredis";
import { logger } from "@finverse/logger";
import { config } from "../config";
import { tryCatch } from "../utils/try-catch";
import type { CacheHealth } from "../types/cache.types";

export class CacheClient {
  private static instance: Redis | null = null;
  private static readonly log = logger.child({ subsystem: "cache", app: "chat" });

  public static initialize(): Redis {
    // Return existing instance if already initialized
    if (CacheClient.instance) return CacheClient.instance;

    // Store the singleton.
    CacheClient.instance = new Redis(config.cache.url, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    if (config.logging.cache) {
      CacheClient.log.info("Cache client initialized");
    }
    return CacheClient.instance;
  }

  // Return instance or initialize if not already created
  public static getInstance(): Redis {
    return CacheClient.instance ?? CacheClient.initialize();
  }

  // Attempt connection if needed and verify connectivity via ping
  public static async healthCheck(client: Redis = CacheClient.getInstance()): Promise<CacheHealth> {
    const [error] = await tryCatch(async () => {
      if (client.status !== "ready") await client.connect();
      await client.ping();
    });

    if (error) {
      if (config.logging.cache) {
        CacheClient.log.warn({ err: error }, "Cache health check failed");
      }
      return { status: "down", detail: error.message };
    }

    if (config.logging.cache) {
      CacheClient.log.debug("Cache health check passed");
    }
    return { status: "up" };
  }
}

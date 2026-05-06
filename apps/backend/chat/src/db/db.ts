import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { logger } from "@finverse/logger";
import { PrismaClient } from "../generated/prisma/client";
import { config } from "../config";
import { tryCatch } from "../utils/try-catch";
import type { DatabaseHealth } from "../types/database.types";

export class DatabaseClient {
  private static instance: PrismaClient | null = null;
  private static readonly log = logger.child({ subsystem: "database", app: "chat" });

  public static initialize(): PrismaClient {
    if (DatabaseClient.instance) {
      return DatabaseClient.instance;
    }

    const databaseUrl = new URL(config.database.url);
    const adapter = new PrismaMariaDb({
      host: databaseUrl.hostname,
      port: Number(databaseUrl.port || 3306),
      user: decodeURIComponent(databaseUrl.username),
      password: decodeURIComponent(databaseUrl.password),
      database: databaseUrl.pathname.replace(/^\//, ""),
      connectionLimit: 5,
    });

    DatabaseClient.instance = new PrismaClient({ adapter });
    if (config.logging.db) {
      DatabaseClient.log.info("Database client initialized");
    }
    return DatabaseClient.instance;
  }

  public static getInstance(): PrismaClient {
    return DatabaseClient.instance ?? DatabaseClient.initialize();
  }

  public static async healthCheck(): Promise<DatabaseHealth> {
    const client = DatabaseClient.getInstance();
    const [error] = await tryCatch(() => client.$queryRaw`SELECT 1`);

    if (error) {
      if (config.logging.db) {
        DatabaseClient.log.warn({ err: error }, "Database health check failed");
      }
      return {
        status: "down",
        detail: error.message,
      };
    }

    if (config.logging.db) {
      DatabaseClient.log.debug("Database health check passed");
    }
    return { status: "up" };
  }
}

import dotenv from "dotenv";

dotenv.config();

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function envFlag(name: string, defaultValue = true): boolean {
  const value = process.env[name];
  if (value === undefined) return defaultValue;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export const config = {
  server: {
    port: Number(process.env.PORT ?? 42069),
  },
  database: {
    url: requiredEnv("DATABASE_URL"),
  },
  cache: {
    url: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
  },
  logging: {
    db: envFlag("CHAT_LOG_DB", true),
    cache: envFlag("CHAT_LOG_CACHE", true),
    http: envFlag("CHAT_LOG_HTTP", true),
    errors: envFlag("CHAT_LOG_ERRORS", true),
    startup: envFlag("CHAT_LOG_STARTUP", true),
  },
};

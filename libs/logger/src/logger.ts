import pino, { type Logger, type LoggerOptions } from "pino";

const isProd = process.env.NODE_ENV === "production";

function getDefaultOptions(): LoggerOptions {
  const level = process.env.LOG_LEVEL ?? (isProd ? "info" : "debug");
  if (isProd) {
    return { level };
  }
  try {
    require.resolve("pino-pretty");
    return {
      level,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          singleLine: true,
        },
      },
    };
  } catch {
    return { level };
  }
}

const defaultOptions = getDefaultOptions();

/**
 * Creates a pino logger with optional overrides.
 * Use this when you need a custom logger (e.g. different level or no pretty).
 */
export function createLogger(options: LoggerOptions = {}): Logger {
  return pino({
    ...defaultOptions,
    ...options,
  });
}

/**
 * Default shared logger for the monorepo.
 * Pretty-printed in development, JSON in production.
 */
export const logger = createLogger();

export type { Logger, LoggerOptions };

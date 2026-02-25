import { describe, it, expect } from "vitest";
import { createLogger, logger } from "../src/logger";

describe("createLogger", () => {
  it("returns a pino Logger instance", () => {
    const log = createLogger();
    expect(log).toBeDefined();
    expect(typeof log.info).toBe("function");
    expect(typeof log.error).toBe("function");
    expect(typeof log.warn).toBe("function");
    expect(typeof log.debug).toBe("function");
    expect(typeof log.trace).toBe("function");
    expect(typeof log.fatal).toBe("function");
    expect(typeof log.child).toBe("function");
  });

  it("can be called with no arguments", () => {
    expect(() => createLogger()).not.toThrow();
    const log = createLogger();
    expect(log).toBeDefined();
  });

  it("accepts custom options and returns a usable logger", () => {
    const log = createLogger({ level: "silent" });
    expect(log).toBeDefined();
    expect(() => log.info("test")).not.toThrow();
    expect(() => log.error("error")).not.toThrow();
  });

  it("createLogger with level override produces logger at that level", () => {
    const log = createLogger({ level: "warn" });
    expect(log.level).toBe("warn");
  });

  it("returns a new instance each time", () => {
    const a = createLogger();
    const b = createLogger();
    expect(a).not.toBe(b);
  });
});

describe("logger", () => {
  it("is the default shared logger instance", () => {
    expect(logger).toBeDefined();
    expect(logger).toBeInstanceOf(Object);
  });

  it("exposes standard pino log methods", () => {
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.debug).toBe("function");
  });

  it("info and error can be called without throwing", () => {
    expect(() => logger.info("test message")).not.toThrow();
    expect(() => logger.error("error message")).not.toThrow();
  });

  it("supports structured logging with merge object", () => {
    expect(() =>
      logger.info({ reqId: "abc", userId: 1 }, "request received")
    ).not.toThrow();
  });

  it("child returns a child logger", () => {
    const child = logger.child({ module: "test" });
    expect(child).toBeDefined();
    expect(typeof child.info).toBe("function");
    expect(() => child.info("child log")).not.toThrow();
  });
});

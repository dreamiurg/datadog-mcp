import { describe, expect, it } from "vitest";
import { createHttpLogger, createToolLogger, logger } from "./logger.js";

describe("logger", () => {
  describe("logger instance", () => {
    it("exports a pino logger", () => {
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe("function");
      expect(typeof logger.error).toBe("function");
      expect(typeof logger.warn).toBe("function");
      expect(typeof logger.debug).toBe("function");
    });
  });

  describe("createToolLogger", () => {
    it("creates a child logger with tool context", () => {
      const toolLogger = createToolLogger("getMonitors");

      expect(toolLogger).toBeDefined();
      expect(typeof toolLogger.info).toBe("function");
      expect(typeof toolLogger.error).toBe("function");
    });

    it("creates different loggers for different tools", () => {
      const logger1 = createToolLogger("tool1");
      const logger2 = createToolLogger("tool2");

      expect(logger1).not.toBe(logger2);
    });
  });

  describe("createHttpLogger", () => {
    it("creates a child logger with service context", () => {
      const httpLogger = createHttpLogger("datadog");

      expect(httpLogger).toBeDefined();
      expect(typeof httpLogger.info).toBe("function");
      expect(typeof httpLogger.error).toBe("function");
    });

    it("creates different loggers for different services", () => {
      const logger1 = createHttpLogger("service1");
      const logger2 = createHttpLogger("service2");

      expect(logger1).not.toBe(logger2);
    });
  });
});

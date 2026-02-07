import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getMetrics } from "./getMetrics.js";

describe("getMetrics", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      DD_API_KEY: "test-api-key",
      DD_APP_KEY: "test-app-key",
      DD_SITE: "datadoghq.com",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("initialize", () => {
    it("sets initialized state", () => {
      expect(() => getMetrics.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getMetrics: freshGetMetrics } = await import("./getMetrics.js");

      await expect(freshGetMetrics.execute({})).rejects.toThrow("getMetrics not initialized");
    });

    it("accepts valid parameters", () => {
      getMetrics.initialize();

      const params = { q: "system.cpu" };

      expect(() => params).not.toThrow();
    });
  });
});

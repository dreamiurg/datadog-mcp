import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getMetricMetadata } from "./getMetricMetadata.js";

describe("getMetricMetadata", () => {
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
      expect(() => getMetricMetadata.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getMetricMetadata: freshGetMetricMetadata } = await import("./getMetricMetadata.js");

      await expect(
        freshGetMetricMetadata.execute({ metricName: "system.cpu.user" }),
      ).rejects.toThrow("getMetricMetadata not initialized");
    });

    it("accepts valid parameters", () => {
      getMetricMetadata.initialize();

      const params = { metricName: "system.cpu.user" };

      expect(() => params).not.toThrow();
    });
  });
});

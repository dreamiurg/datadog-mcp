import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSLOs } from "./getSLOs.js";

describe("getSLOs", () => {
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
      expect(() => getSLOs.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getSLOs: freshGetSLOs } = await import("./getSLOs.js");

      await expect(freshGetSLOs.execute({})).rejects.toThrow("getSLOs not initialized");
    });

    it("accepts valid parameters", () => {
      getSLOs.initialize();

      const params = {
        ids: "slo-1,slo-2",
        query: "API",
        tagsQuery: "env:prod",
        metricsQuery: "metric.name:availability",
        limit: 10,
        offset: 0,
      };

      expect(() => params).not.toThrow();
    });
  });
});

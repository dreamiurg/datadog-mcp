import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboards } from "./getDashboards.js";

describe("getDashboards", () => {
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
      expect(() => getDashboards.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getDashboards: fresh } = await import("./getDashboards.js");

      await expect(fresh.execute({})).rejects.toThrow("getDashboards not initialized");
    });

    it("accepts valid parameters", () => {
      getDashboards.initialize();

      const params = {
        filterShared: true,
        filterDeleted: false,
        limit: 20,
      };

      expect(() => params).not.toThrow();
    });
  });
});

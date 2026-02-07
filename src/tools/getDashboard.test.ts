import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboard } from "./getDashboard.js";

describe("getDashboard", () => {
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
      expect(() => getDashboard.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getDashboard: fresh } = await import("./getDashboard.js");

      await expect(fresh.execute({ dashboardId: "abc-def-ghi" })).rejects.toThrow(
        "getDashboard not initialized",
      );
    });

    it("accepts valid parameters", () => {
      getDashboard.initialize();

      const params = {
        dashboardId: "abc-def-ghi",
      };

      expect(() => params).not.toThrow();
    });
  });
});

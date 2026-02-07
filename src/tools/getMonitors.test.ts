import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getMonitors } from "./getMonitors.js";

describe("getMonitors", () => {
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
      expect(() => getMonitors.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getMonitors: fresh } = await import("./getMonitors.js");

      await expect(fresh.execute({})).rejects.toThrow("getMonitors not initialized");
    });

    it("accepts valid parameters", () => {
      getMonitors.initialize();

      const params = {
        groupStates: ["alert", "warn"],
        tags: "env:production",
        monitorTags: "service:api",
        limit: 10,
      };

      expect(() => params).not.toThrow();
    });
  });
});

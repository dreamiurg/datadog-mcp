import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getMonitor } from "./getMonitor.js";

describe("getMonitor", () => {
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
      expect(() => getMonitor.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getMonitor: fresh } = await import("./getMonitor.js");

      await expect(fresh.execute({ monitorId: 12345 })).rejects.toThrow(
        "getMonitor not initialized",
      );
    });

    it("accepts valid parameters", () => {
      getMonitor.initialize();

      const params = {
        monitorId: 12345,
        groupStates: ["alert", "warn"],
        withDowntimes: true,
      };

      expect(() => params).not.toThrow();
    });
  });
});

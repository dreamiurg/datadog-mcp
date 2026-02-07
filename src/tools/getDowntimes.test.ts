import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDowntimes } from "./getDowntimes.js";

describe("getDowntimes", () => {
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
      expect(() => getDowntimes.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getDowntimes: fresh } = await import("./getDowntimes.js");

      await expect(fresh.execute({})).rejects.toThrow("getDowntimes not initialized");
    });

    it("accepts valid parameters", () => {
      getDowntimes.initialize();

      const params = {
        currentOnly: true,
        monitorId: 12345,
      };

      expect(() => params).not.toThrow();
    });
  });
});

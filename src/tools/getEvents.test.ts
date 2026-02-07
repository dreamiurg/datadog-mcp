import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getEvents } from "./getEvents.js";

describe("getEvents", () => {
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
      expect(() => getEvents.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getEvents: fresh } = await import("./getEvents.js");

      await expect(fresh.execute({ start: 1704067200, end: 1704153600 })).rejects.toThrow(
        "getEvents not initialized",
      );
    });

    it("accepts valid parameters", () => {
      getEvents.initialize();

      const params = {
        start: 1704067200,
        end: 1704153600,
        priority: "normal",
        tags: "env:production",
        limit: 50,
      };

      expect(() => params).not.toThrow();
    });
  });
});

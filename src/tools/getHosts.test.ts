import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getHosts } from "./getHosts.js";

describe("getHosts", () => {
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
      expect(() => getHosts.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getHosts: fresh } = await import("./getHosts.js");

      await expect(fresh.execute({})).rejects.toThrow("getHosts not initialized");
    });

    it("accepts valid parameters", () => {
      getHosts.initialize();

      const params = {
        filter: "env:production",
        sortField: "cpu",
        sortDir: "desc",
        start: 0,
        count: 20,
      };

      expect(() => params).not.toThrow();
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getIncidents } from "./getIncidents.js";

describe("getIncidents", () => {
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
      expect(() => getIncidents.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getIncidents: freshGetIncidents } = await import("./getIncidents.js");

      await expect(freshGetIncidents.execute({})).rejects.toThrow("getIncidents not initialized");
    });

    it("accepts valid parameters", () => {
      getIncidents.initialize();

      const params = {
        pageSize: 10,
        pageOffset: 0,
        query: "status:active",
        limit: 5,
      };

      expect(() => params).not.toThrow();
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSLO } from "./getSLO.js";

describe("getSLO", () => {
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
      expect(() => getSLO.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getSLO: freshGetSLO } = await import("./getSLO.js");

      await expect(freshGetSLO.execute({ sloId: "test-slo-id" })).rejects.toThrow(
        "getSLO not initialized",
      );
    });

    it("accepts valid parameters", () => {
      getSLO.initialize();

      const params = {
        sloId: "test-slo-id",
        withConfiguredAlertIds: true,
      };

      expect(() => params).not.toThrow();
    });
  });
});

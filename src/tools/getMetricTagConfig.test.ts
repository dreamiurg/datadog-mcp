import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getMetricTagConfig } from "./getMetricTagConfig.js";

describe("getMetricTagConfig", () => {
  const originalEnv = process.env;
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      DD_API_KEY: "test-api-key",
      DD_APP_KEY: "test-app-key",
      DD_SITE: "datadoghq.com",
    };
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
  });

  describe("initialize", () => {
    it("sets initialized state", () => {
      expect(() => getMetricTagConfig.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getMetricTagConfig: fresh } = await import("./getMetricTagConfig.js");
      await expect(fresh.execute({ metricName: "system.cpu.user" })).rejects.toThrow(
        "getMetricTagConfig not initialized",
      );
    });

    it("makes correct API call", async () => {
      getMetricTagConfig.initialize();
      const mockResponse = { data: { id: "system.cpu.user", type: "metric" } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });
      const result = await getMetricTagConfig.execute({
        metricName: "system.cpu.user",
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain("/api/v2/metrics/system.cpu.user/tags");
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      getMetricTagConfig.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        text: async () => "Access denied",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(getMetricTagConfig.execute({ metricName: "system.cpu.user" })).rejects.toThrow();
    });
  });
});

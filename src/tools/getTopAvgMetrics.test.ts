import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTopAvgMetrics } from "./getTopAvgMetrics.js";

describe("getTopAvgMetrics", () => {
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
      expect(() => getTopAvgMetrics.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getTopAvgMetrics: fresh } = await import("./getTopAvgMetrics.js");
      await expect(fresh.execute({})).rejects.toThrow("getTopAvgMetrics not initialized");
    });

    it("makes correct API call and returns results", async () => {
      getTopAvgMetrics.initialize();
      const mockResponse = {
        usage: [{ metric_name: "custom.metric.1", avg_metric_hour: 42, max_metric_hour: 100 }],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getTopAvgMetrics.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/usage/top_avg_metrics"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes query params when provided", async () => {
      getTopAvgMetrics.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ usage: [] }) });
      await getTopAvgMetrics.execute({ month: "2025-01", limit: 10 });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("month=2025-01"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      getTopAvgMetrics.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(getTopAvgMetrics.execute({})).rejects.toThrow();
    });
  });
});

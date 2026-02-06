import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLogsMetrics } from "./getLogsMetrics.js";

describe("getLogsMetrics", () => {
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
      expect(() => getLogsMetrics.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getLogsMetrics: fresh } = await import("./getLogsMetrics.js");
      await expect(fresh.execute({})).rejects.toThrow("getLogsMetrics not initialized");
    });

    it("makes correct API call and returns results", async () => {
      getLogsMetrics.initialize();
      const mockResponse = {
        data: [
          {
            id: "metric-1",
            type: "logs_metrics",
            attributes: { compute: { aggregation_type: "count" }, filter: { query: "*" } },
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getLogsMetrics.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/logs/config/metrics"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      getLogsMetrics.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(getLogsMetrics.execute({})).rejects.toThrow();
    });
  });
});

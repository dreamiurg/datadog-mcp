import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSpansMetrics } from "./getSpansMetrics.js";

describe("getSpansMetrics", () => {
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
      expect(() => getSpansMetrics.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getSpansMetrics: fresh } = await import("./getSpansMetrics.js");
      await expect(fresh.execute({})).rejects.toThrow("getSpansMetrics not initialized");
    });

    it("makes correct API call and returns results", async () => {
      getSpansMetrics.initialize();
      const mockResponse = {
        data: [
          {
            id: "metric-1",
            type: "spans_metrics",
            attributes: { compute: { aggregation_type: "distribution", path: "duration" } },
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getSpansMetrics.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/apm/config/metrics"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      getSpansMetrics.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(getSpansMetrics.execute({})).rejects.toThrow();
    });
  });
});

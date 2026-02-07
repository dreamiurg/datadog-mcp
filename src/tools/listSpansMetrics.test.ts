import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listSpansMetrics } from "./listSpansMetrics.js";

describe("listSpansMetrics", () => {
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
      expect(() => listSpansMetrics.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listSpansMetrics: fresh } = await import("./listSpansMetrics.js");
      await expect(fresh.execute({})).rejects.toThrow("listSpansMetrics not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listSpansMetrics.initialize();
      const mockResponse = {
        data: [{ id: "metric-1", type: "spans_metric", attributes: { filter: { query: "*" } } }],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listSpansMetrics.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/apm/config/metrics"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      listSpansMetrics.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listSpansMetrics.execute({})).rejects.toThrow();
    });
  });
});

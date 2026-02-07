import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDbmQueryMetrics } from "./getDbmQueryMetrics.js";

describe("getDbmQueryMetrics", () => {
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
      expect(() => getDbmQueryMetrics.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getDbmQueryMetrics: fresh } = await import("./getDbmQueryMetrics.js");
      await expect(fresh.execute({})).rejects.toThrow("getDbmQueryMetrics not initialized");
    });

    it("makes correct API call", async () => {
      getDbmQueryMetrics.initialize();
      const mockResponse = { data: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });
      const result = await getDbmQueryMetrics.execute({});
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain("/api/v2/dbm/metrics/query");
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      getDbmQueryMetrics.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        text: async () => "Access denied",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(getDbmQueryMetrics.execute({})).rejects.toThrow();
    });
  });
});

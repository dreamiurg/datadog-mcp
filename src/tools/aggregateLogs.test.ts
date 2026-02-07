import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { aggregateLogs } from "./aggregateLogs.js";

describe("aggregateLogs", () => {
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
      expect(() => aggregateLogs.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { aggregateLogs: freshAggregateLogs } = await import("./aggregateLogs.js");

      await expect(freshAggregateLogs.execute({})).rejects.toThrow("aggregateLogs not initialized");
    });

    it("aggregates logs with filter", async () => {
      aggregateLogs.initialize();

      const mockResponse = {
        data: {
          buckets: [
            { by: { status: "error" }, computes: { count: 100 } },
            { by: { status: "warn" }, computes: { count: 50 } },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await aggregateLogs.execute({
        filter: {
          query: "service:api",
          from: "now-1h",
          to: "now",
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/logs/analytics/aggregate"),
        expect.objectContaining({
          method: "POST",
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("aggregates logs with compute and groupBy", async () => {
      aggregateLogs.initialize();

      const mockResponse = {
        data: {
          buckets: [{ by: { service: "api" }, computes: { count: 1000 } }],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await aggregateLogs.execute({
        filter: { query: "*" },
        compute: [{ aggregation: "count" }],
        groupBy: [{ facet: "service", limit: 10 }],
      });

      expect(mockFetch).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("includes options when provided", async () => {
      aggregateLogs.initialize();

      const mockResponse = {
        data: { buckets: [] },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await aggregateLogs.execute({
        filter: { query: "*" },
        options: { timezone: "UTC" },
      });

      expect(mockFetch).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      aggregateLogs.initialize();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });

      await expect(aggregateLogs.execute({ filter: { query: "*" } })).rejects.toThrow();
    });
  });
});

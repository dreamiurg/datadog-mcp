import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { aggregateRumEvents } from "./aggregateRumEvents.js";

describe("aggregateRumEvents", () => {
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
      expect(() => aggregateRumEvents.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { aggregateRumEvents: fresh } = await import("./aggregateRumEvents.js");
      await expect(fresh.execute({ compute: [{ aggregation: "count" }] })).rejects.toThrow(
        "aggregateRumEvents not initialized",
      );
    });

    it("aggregates with count and returns results", async () => {
      aggregateRumEvents.initialize();
      const mockResponse = {
        data: { buckets: [{ computes: { c0: 42 } }] },
        meta: {},
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await aggregateRumEvents.execute({
        compute: [{ aggregation: "count" }],
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/rum/analytics/aggregate"),
        expect.objectContaining({ method: "POST", body: expect.stringContaining("count") }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("aggregates with filter and group_by", async () => {
      aggregateRumEvents.initialize();
      const mockResponse = {
        data: {
          buckets: [
            { computes: { c0: 100 }, by: { "@view.name": "home" } },
            { computes: { c0: 50 }, by: { "@view.name": "about" } },
          ],
        },
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await aggregateRumEvents.execute({
        compute: [{ aggregation: "count" }],
        filter: { query: "@type:view", from: "now-1h", to: "now" },
        group_by: [{ facet: "@view.name", limit: 10 }],
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/rum/analytics/aggregate"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("@view.name"),
        }),
      );
      expect(result?.data?.buckets).toHaveLength(2);
    });

    it("aggregates with percentile and metric", async () => {
      aggregateRumEvents.initialize();
      const mockResponse = {
        data: { buckets: [{ computes: { c0: 1234.56 } }] },
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      await aggregateRumEvents.execute({
        compute: [{ aggregation: "pc99", metric: "@view.loading_time", type: "web" }],
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/rum/analytics/aggregate"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("pc99"),
        }),
      );
    });

    it("aggregates with sort in group_by", async () => {
      aggregateRumEvents.initialize();
      const mockResponse = {
        data: { buckets: [{ computes: { c0: 100 }, by: { "@country": "US" } }] },
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      await aggregateRumEvents.execute({
        compute: [{ aggregation: "sum", metric: "@view.loading_time" }],
        group_by: [{ facet: "@country", sort: { aggregation: "sum", order: "desc" } }],
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/rum/analytics/aggregate"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("desc"),
        }),
      );
    });
  });
});

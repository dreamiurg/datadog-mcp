import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { aggregateSpans } from "./aggregateSpans.js";

describe("aggregateSpans", () => {
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
      expect(() => aggregateSpans.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { aggregateSpans: freshAggregateSpans } = await import("./aggregateSpans.js");

      await expect(freshAggregateSpans.execute({})).rejects.toThrow(
        "aggregateSpans not initialized",
      );
    });

    it("aggregates spans with compute and groupBy", async () => {
      aggregateSpans.initialize();

      const mockResponse = {
        data: {
          buckets: [
            { by: { service: "api" }, computes: { c0: 150 } },
            { by: { service: "web" }, computes: { c0: 75 } },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await aggregateSpans.execute({
        filter: { query: "*", from: "now-1h", to: "now" },
        compute: [{ aggregation: "count" }],
        groupBy: [{ facet: "service" }],
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/spans/analytics/aggregate"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("group_by"),
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });
});

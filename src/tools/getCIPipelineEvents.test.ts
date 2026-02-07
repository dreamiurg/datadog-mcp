import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCIPipelineEvents } from "./getCIPipelineEvents.js";

describe("getCIPipelineEvents", () => {
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
      expect(() => getCIPipelineEvents.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getCIPipelineEvents: fresh } = await import("./getCIPipelineEvents.js");
      await expect(
        fresh.execute({
          compute: [{ aggregation: "count" }],
        }),
      ).rejects.toThrow("getCIPipelineEvents not initialized");
    });

    it("makes correct API call and returns results", async () => {
      getCIPipelineEvents.initialize();

      const params = {
        compute: [
          {
            aggregation: "count",
            type: "total",
          },
          {
            aggregation: "avg",
            metric: "@duration",
            type: "total",
          },
        ],
        filter: {
          query: "status:error",
          from: "now-7d",
          to: "now",
        },
        group_by: [
          {
            facet: "@ci.pipeline.name",
            limit: 10,
          },
        ],
      };

      const mockResponse = {
        data: {
          buckets: [
            {
              computes: {
                c0: 42,
                c1: 123.45,
              },
              by: {
                "@ci.pipeline.name": "my-pipeline",
              },
            },
          ],
        },
        meta: {
          elapsed: 100,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await getCIPipelineEvents.execute(params);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.datadoghq.com/api/v2/ci/pipelines/analytics",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "DD-API-KEY": "test-api-key",
            "DD-APPLICATION-KEY": "test-app-key",
          },
          body: JSON.stringify(params),
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles minimal params", async () => {
      getCIPipelineEvents.initialize();

      const params = {
        compute: [{ aggregation: "count" }],
      };

      const mockResponse = {
        data: {
          buckets: [
            {
              computes: { c0: 100 },
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await getCIPipelineEvents.execute(params);

      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      getCIPipelineEvents.initialize();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({ errors: ["Invalid compute aggregation"] }),
      });

      await expect(
        getCIPipelineEvents.execute({
          compute: [{ aggregation: "count" }],
        }),
      ).rejects.toThrow();
    });
  });
});

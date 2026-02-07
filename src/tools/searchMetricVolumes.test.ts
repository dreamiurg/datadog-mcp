import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { searchMetricVolumes } from "./searchMetricVolumes.js";

describe("searchMetricVolumes", () => {
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
      expect(() => searchMetricVolumes.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { searchMetricVolumes: fresh } = await import("./searchMetricVolumes.js");
      await expect(fresh.execute({})).rejects.toThrow("searchMetricVolumes not initialized");
    });

    it("makes correct API call with no params", async () => {
      searchMetricVolumes.initialize();

      const mockResponse = {
        data: [
          {
            id: "system.cpu.usage",
            type: "metrics",
            attributes: {
              ingested_volume: 1000000,
              indexed_volume: 500000,
              percentile_volume: 100000,
            },
          },
        ],
        meta: {
          pagination: {
            next_cursor: "cursor123",
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await searchMetricVolumes.execute({});

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith("https://api.datadoghq.com/api/v2/metrics", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "DD-API-KEY": "test-api-key",
          "DD-APPLICATION-KEY": "test-app-key",
        },
        body: undefined,
      });
      expect(result).toEqual(mockResponse);
    });

    it("makes correct API call with all params", async () => {
      searchMetricVolumes.initialize();

      const params = {
        filterMetric: "system.cpu.*",
        filterConfigured: true,
        filterTagsConfigured: "env:prod",
        filterActiveWithin: 24,
        windowSeconds: 3600,
      };

      const mockResponse = {
        data: [
          {
            id: "system.cpu.user",
            type: "metrics",
            attributes: {
              ingested_volume: 500000,
              indexed_volume: 250000,
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await searchMetricVolumes.execute(params);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain("filter%5Bmetric%5D=system.cpu.*");
      expect(callUrl).toContain("filter%5Bconfigured%5D=true");
      expect(callUrl).toContain("filter%5Btags_configured%5D=env%3Aprod");
      expect(callUrl).toContain("filter%5Bactive_within%5D=24");
      expect(callUrl).toContain("window%5Bseconds%5D=3600");
      expect(result).toEqual(mockResponse);
    });

    it("makes correct API call with partial params", async () => {
      searchMetricVolumes.initialize();

      const params = {
        filterMetric: "aws.ec2.*",
        filterActiveWithin: 48,
      };

      const mockResponse = {
        data: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await searchMetricVolumes.execute(params);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain("filter%5Bmetric%5D=aws.ec2.*");
      expect(callUrl).toContain("filter%5Bactive_within%5D=48");
      expect(callUrl).not.toContain("filter%5Bconfigured%5D");
      expect(callUrl).not.toContain("filter%5Btags_configured%5D");
      expect(callUrl).not.toContain("window%5Bseconds%5D");
      expect(result).toEqual(mockResponse);
    });

    it("handles boolean false filterConfigured", async () => {
      searchMetricVolumes.initialize();

      const params = {
        filterConfigured: false,
      };

      const mockResponse = {
        data: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      await searchMetricVolumes.execute(params);

      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain("filter%5Bconfigured%5D=false");
    });

    it("handles API errors", async () => {
      searchMetricVolumes.initialize();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({ errors: ["Invalid filter parameter"] }),
      });

      await expect(searchMetricVolumes.execute({ filterMetric: "invalid**" })).rejects.toThrow();
    });
  });
});

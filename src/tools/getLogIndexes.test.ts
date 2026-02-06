import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLogIndexes } from "./getLogIndexes.js";

describe("getLogIndexes", () => {
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
      expect(() => getLogIndexes.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getLogIndexes: fresh } = await import("./getLogIndexes.js");
      await expect(fresh.execute({})).rejects.toThrow("getLogIndexes not initialized");
    });

    it("makes correct API call and returns results", async () => {
      getLogIndexes.initialize();
      const mockResponse = {
        indexes: [
          {
            name: "main",
            filter: { query: "*" },
            num_retention_days: 15,
            daily_limit: 200000000,
            is_rate_limited: false,
            num_flex_logs_retention_days: 30,
            exclusion_filters: [
              {
                name: "exclude-debug",
                filter: { query: "status:debug", sample_rate: 1.0 },
                is_enabled: true,
              },
            ],
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getLogIndexes.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/logs/config/indexes"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });
  });
});

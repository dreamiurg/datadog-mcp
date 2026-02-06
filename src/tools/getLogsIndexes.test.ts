import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLogsIndexes } from "./getLogsIndexes.js";

describe("getLogsIndexes", () => {
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
      expect(() => getLogsIndexes.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getLogsIndexes: fresh } = await import("./getLogsIndexes.js");
      await expect(fresh.execute({})).rejects.toThrow("getLogsIndexes not initialized");
    });

    it("makes correct API call and returns results", async () => {
      getLogsIndexes.initialize();
      const mockResponse = {
        indexes: [
          { name: "main", filter: { query: "*" }, num_retention_days: 15, daily_limit: 200000000 },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getLogsIndexes.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/logs/config/indexes"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      getLogsIndexes.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(getLogsIndexes.execute({})).rejects.toThrow();
    });
  });
});

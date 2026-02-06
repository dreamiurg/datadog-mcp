import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDbmSamples } from "./getDbmSamples.js";

describe("getDbmSamples", () => {
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
      expect(() => getDbmSamples.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getDbmSamples: fresh } = await import("./getDbmSamples.js");
      await expect(fresh.execute({})).rejects.toThrow("getDbmSamples not initialized");
    });

    it("makes correct API call and returns results", async () => {
      getDbmSamples.initialize();
      const mockResponse = {
        data: [
          {
            id: "sample-1",
            type: "dbm_sample",
            attributes: {
              timestamp: "2024-01-01T12:00:00Z",
              host: "db-host-1",
              db_name: "production_db",
              query_signature: "SELECT * FROM users WHERE id = ?",
              statement: "SELECT * FROM users WHERE id = 123",
              duration: 45.5,
              rows_affected: 1,
            },
          },
        ],
        meta: {
          page: {
            after: "cursor-789",
          },
        },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getDbmSamples.execute({
        start: 1704110400,
        end: 1704196800,
        source: "postgresql",
        dbHost: "db-host-1",
        dbName: "production_db",
        limit: 100,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(
          /\/api\/v2\/dbm\/samples\?.*start=1704110400.*end=1704196800.*source=postgresql.*db_host=db-host-1.*db_name=production_db.*limit=100/,
        ),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("builds query string with only defined parameters", async () => {
      getDbmSamples.initialize();
      const mockResponse = { data: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await getDbmSamples.execute({
        source: "mysql",
        limit: 50,
      });

      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain("source=mysql");
      expect(callUrl).toContain("limit=50");
      expect(callUrl).not.toContain("start=");
      expect(callUrl).not.toContain("end=");
      expect(callUrl).not.toContain("db_host=");
      expect(callUrl).not.toContain("db_name=");
    });

    it("handles empty parameters correctly", async () => {
      getDbmSamples.initialize();
      const mockResponse = { data: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getDbmSamples.execute({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/dbm/samples"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("properly encodes special characters in query parameters", async () => {
      getDbmSamples.initialize();
      const mockResponse = { data: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await getDbmSamples.execute({
        dbHost: "db-host with spaces",
        dbName: "db&name=special",
      });

      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain("db_host=db-host%20with%20spaces");
      expect(callUrl).toContain("db_name=db%26name%3Dspecial");
    });
  });
});

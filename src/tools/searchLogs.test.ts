import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { searchLogs } from "./searchLogs.js";

describe("searchLogs", () => {
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
      expect(() => searchLogs.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { searchLogs: freshSearchLogs } = await import("./searchLogs.js");

      await expect(freshSearchLogs.execute({})).rejects.toThrow("searchLogs not initialized");
    });

    it("searches logs with filter", async () => {
      searchLogs.initialize();

      const mockResponse = {
        data: [
          { id: "log-1", attributes: { message: "Error occurred" } },
          { id: "log-2", attributes: { message: "Warning message" } },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await searchLogs.execute({
        filter: {
          query: "service:api status:error",
          from: "now-1h",
          to: "now",
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/logs/events/search"),
        expect.objectContaining({
          method: "POST",
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("applies sort parameter", async () => {
      searchLogs.initialize();

      const mockResponse = {
        data: [{ id: "log-1", attributes: { timestamp: "2024-01-01" } }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await searchLogs.execute({
        filter: { query: "*" },
        sort: "-timestamp",
      });

      expect(mockFetch).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("applies pagination parameters", async () => {
      searchLogs.initialize();

      const mockResponse = {
        data: [{ id: "log-1" }],
        meta: { page: { after: "next-cursor" } },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await searchLogs.execute({
        filter: { query: "*" },
        page: { limit: 100, cursor: "some-cursor" },
      });

      expect(mockFetch).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("respects limit parameter by truncating results", async () => {
      searchLogs.initialize();

      const mockResponse = {
        data: [{ id: "log-1" }, { id: "log-2" }, { id: "log-3" }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await searchLogs.execute({
        filter: { query: "*" },
        limit: 2,
      });

      expect(result?.data).toHaveLength(2);
    });

    it("handles API errors", async () => {
      searchLogs.initialize();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });

      await expect(searchLogs.execute({ filter: { query: "*" } })).rejects.toThrow();
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { searchSLOs } from "./searchSLOs.js";

describe("searchSLOs", () => {
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
      expect(() => searchSLOs.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { searchSLOs: fresh } = await import("./searchSLOs.js");
      await expect(fresh.execute({})).rejects.toThrow("searchSLOs not initialized");
    });

    it("makes correct API call and returns results", async () => {
      searchSLOs.initialize();
      const mockResponse = { data: { attributes: { slos: [] } } };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await searchSLOs.execute({ query: "service:web" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/slo/search"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes query params when provided", async () => {
      searchSLOs.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: {} }) });
      await searchSLOs.execute({ query: "env:prod", page_size: 10 });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("query=env%3Aprod"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      searchSLOs.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(searchSLOs.execute({})).rejects.toThrow();
    });
  });
});

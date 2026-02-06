import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { searchCases } from "./searchCases.js";

describe("searchCases", () => {
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
      expect(() => searchCases.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { searchCases: fresh } = await import("./searchCases.js");
      await expect(fresh.execute({})).rejects.toThrow("searchCases not initialized");
    });

    it("makes correct API call and returns results", async () => {
      searchCases.initialize();
      const mockResponse = {
        data: [
          {
            id: "case-1",
            type: "case",
            attributes: { title: "Test Case", status: "open", priority: "high" },
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await searchCases.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/cases"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes query params when provided", async () => {
      searchCases.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await searchCases.execute({ page_size: 10, filter: "status:open", sort_asc: true });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("page%5Bsize%5D=10"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      searchCases.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(searchCases.execute({})).rejects.toThrow();
    });
  });
});

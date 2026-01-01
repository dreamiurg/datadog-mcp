import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { searchSpans } from "./searchSpans.js";

describe("searchSpans", () => {
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
      expect(() => searchSpans.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      // Create fresh module to reset initialized state
      vi.resetModules();
      const { searchSpans: freshSearchSpans } = await import("./searchSpans.js");

      await expect(freshSearchSpans.execute({})).rejects.toThrow("searchSpans not initialized");
    });

    it("searches spans with filter and returns results", async () => {
      searchSpans.initialize();

      const mockResponse = {
        data: [
          { id: "span-1", attributes: { service: "api" } },
          { id: "span-2", attributes: { service: "web" } },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await searchSpans.execute({
        filter: { query: "service:api", from: "now-1h", to: "now" },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/spans/events/search"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("service:api"),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("respects limit parameter by truncating results", async () => {
      searchSpans.initialize();

      const mockResponse = {
        data: [{ id: "span-1" }, { id: "span-2" }, { id: "span-3" }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await searchSpans.execute({
        filter: { query: "*" },
        limit: 2,
      });

      expect(result?.data).toHaveLength(2);
    });
  });
});

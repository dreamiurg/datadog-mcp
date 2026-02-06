import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { searchRumEvents } from "./searchRumEvents.js";

describe("searchRumEvents", () => {
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
      expect(() => searchRumEvents.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { searchRumEvents: fresh } = await import("./searchRumEvents.js");
      await expect(fresh.execute({})).rejects.toThrow("searchRumEvents not initialized");
    });

    it("searches with filter and returns results", async () => {
      searchRumEvents.initialize();
      const mockResponse = { data: [{ id: "1" }, { id: "2" }] };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await searchRumEvents.execute({ filter: { query: "@type:view" } });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/rum/events/search"),
        expect.objectContaining({ method: "POST", body: expect.stringContaining("@type:view") }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("respects limit parameter", async () => {
      searchRumEvents.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [{ id: "1" }, { id: "2" }, { id: "3" }] }),
      });
      const result = await searchRumEvents.execute({ filter: { query: "*" }, limit: 2 });
      expect(result?.data).toHaveLength(2);
    });

    it("handles pagination and sort parameters", async () => {
      searchRumEvents.initialize();
      const mockResponse = { data: [{ id: "1" }], meta: { page: { after: "cursor-123" } } };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      await searchRumEvents.execute({
        filter: { query: "@type:action" },
        sort: "-timestamp",
        page: { limit: 50, cursor: "cursor-abc" },
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/rum/events/search"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("cursor-abc"),
        }),
      );
    });
  });
});

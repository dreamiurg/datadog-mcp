import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getNotebooks } from "./getNotebooks.js";

describe("getNotebooks", () => {
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
      expect(() => getNotebooks.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getNotebooks: fresh } = await import("./getNotebooks.js");
      await expect(fresh.execute({})).rejects.toThrow("getNotebooks not initialized");
    });

    it("makes correct API call and returns results", async () => {
      getNotebooks.initialize();
      const mockResponse = {
        data: [
          {
            id: 123,
            type: "notebooks",
            attributes: {
              name: "My Notebook",
              author: {
                handle: "user@example.com",
                name: "John Doe",
              },
              created: "2024-01-01T00:00:00Z",
              modified: "2024-01-02T00:00:00Z",
              status: "published",
              metadata: {},
            },
          },
        ],
        meta: {
          page: {
            total_count: 100,
            total_filtered_count: 1,
          },
        },
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });

      const result = await getNotebooks.execute({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/notebooks"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles authorHandle parameter", async () => {
      getNotebooks.initialize();
      const mockResponse = { data: [] };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });

      await getNotebooks.execute({ authorHandle: "user@example.com" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("author_handle=user%40example.com"),
        expect.anything(),
      );
    });

    it("handles pagination parameters", async () => {
      getNotebooks.initialize();
      const mockResponse = { data: [] };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });

      await getNotebooks.execute({ count: 50, start: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("count=50"),
        expect.anything(),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("start=10"),
        expect.anything(),
      );
    });

    it("handles sort parameters", async () => {
      getNotebooks.initialize();
      const mockResponse = { data: [] };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });

      await getNotebooks.execute({ sortField: "modified", sortDir: "desc" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("sort_field=modified"),
        expect.anything(),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("sort_dir=desc"),
        expect.anything(),
      );
    });

    it("handles query parameter", async () => {
      getNotebooks.initialize();
      const mockResponse = { data: [] };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });

      await getNotebooks.execute({ query: "dashboard metrics" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("query=dashboard%20metrics"),
        expect.anything(),
      );
    });

    it("handles boolean parameters", async () => {
      getNotebooks.initialize();
      const mockResponse = { data: [] };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });

      await getNotebooks.execute({ includeCells: true, isTemplate: false });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("include_cells=true"),
        expect.anything(),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("is_template=false"),
        expect.anything(),
      );
    });

    it("handles type parameter", async () => {
      getNotebooks.initialize();
      const mockResponse = { data: [] };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });

      await getNotebooks.execute({ type: "investigation" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("type=investigation"),
        expect.anything(),
      );
    });
  });
});

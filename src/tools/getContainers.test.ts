import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getContainers } from "./getContainers.js";

describe("getContainers", () => {
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
      expect(() => getContainers.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getContainers: fresh } = await import("./getContainers.js");
      await expect(fresh.execute({})).rejects.toThrow("getContainers not initialized");
    });

    it("makes correct API call and returns results", async () => {
      getContainers.initialize();
      const mockResponse = {
        data: [
          {
            id: "container-1",
            type: "container",
            attributes: {
              name: "my-container",
              image_name: "nginx",
              image_tag: "latest",
              state: "running",
              started_at: "2024-01-01T00:00:00Z",
              tags: ["env:prod", "service:web"],
            },
          },
        ],
        meta: {
          pagination: {
            next_cursor: "abc123",
            total: 100,
          },
        },
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });

      const result = await getContainers.execute({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/containers"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles filter tags parameter", async () => {
      getContainers.initialize();
      const mockResponse = { data: [] };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });

      await getContainers.execute({ filterTags: "env:prod,service:web" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("filter[tags]=env%3Aprod%2Cservice%3Aweb"),
        expect.anything(),
      );
    });

    it("handles pagination parameters", async () => {
      getContainers.initialize();
      const mockResponse = { data: [] };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });

      await getContainers.execute({ pageSize: 50, pageCursor: "xyz789" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("page[size]=50"),
        expect.anything(),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("page[cursor]=xyz789"),
        expect.anything(),
      );
    });

    it("handles groupBy and sort parameters", async () => {
      getContainers.initialize();
      const mockResponse = { data: [] };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });

      await getContainers.execute({ groupBy: "short_image", sort: "-name" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("group_by=short_image"),
        expect.anything(),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("sort=-name"),
        expect.anything(),
      );
    });
  });
});

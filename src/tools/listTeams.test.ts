import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listTeams } from "./listTeams.js";

describe("listTeams", () => {
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
      expect(() => listTeams.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listTeams: fresh } = await import("./listTeams.js");
      await expect(fresh.execute({})).rejects.toThrow("listTeams not initialized");
    });

    it("makes correct API call without params and returns results", async () => {
      listTeams.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: [
            {
              id: "team-1",
              type: "team",
              attributes: {
                name: "Engineering",
                handle: "engineering",
                user_count: 10,
              },
            },
          ],
          meta: { pagination: { total: 1 } },
        }),
      });

      const result = await listTeams.execute({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/team"),
        expect.objectContaining({
          method: "GET",
          body: undefined,
        }),
      );
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].attributes?.name).toBe("Engineering");
    });

    it("includes query parameters when provided", async () => {
      listTeams.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [], meta: {} }),
      });

      await listTeams.execute({
        pageNumber: 2,
        pageSize: 50,
        sort: "name",
        filterKeyword: "dev",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("page%5Bnumber%5D=2"),
        expect.objectContaining({
          method: "GET",
        }),
      );
    });

    it("handles API errors", async () => {
      listTeams.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        text: async () => JSON.stringify({ errors: ["Invalid API key"] }),
        json: async () => ({ errors: ["Invalid API key"] }),
      });

      await expect(listTeams.execute({})).rejects.toThrow();
    });
  });
});

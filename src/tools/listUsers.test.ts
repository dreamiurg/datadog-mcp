import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listUsers } from "./listUsers.js";

describe("listUsers", () => {
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
      expect(() => listUsers.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listUsers: fresh } = await import("./listUsers.js");
      await expect(fresh.execute({})).rejects.toThrow("listUsers not initialized");
    });

    it("makes correct API call without params and returns results", async () => {
      listUsers.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: [
            {
              id: "user-1",
              type: "users",
              attributes: {
                name: "John Doe",
                handle: "john.doe",
                email: "john@example.com",
                status: "Active",
              },
            },
          ],
          meta: { page: { total_count: 1, total_filtered_count: 1 } },
        }),
      });

      const result = await listUsers.execute({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/users"),
        expect.objectContaining({
          method: "GET",
          body: undefined,
        }),
      );
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].attributes?.name).toBe("John Doe");
    });

    it("includes query parameters when provided", async () => {
      listUsers.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [], meta: {} }),
      });

      await listUsers.execute({
        pageSize: 25,
        pageNumber: 1,
        sort: "name",
        sortDir: "asc",
        filter: "john",
        filterStatus: "Active",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("page%5Bsize%5D=25"),
        expect.objectContaining({
          method: "GET",
        }),
      );
    });

    it("handles API errors", async () => {
      listUsers.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        text: async () => JSON.stringify({ errors: ["Invalid API key"] }),
        json: async () => ({ errors: ["Invalid API key"] }),
      });

      await expect(listUsers.execute({})).rejects.toThrow();
    });
  });
});

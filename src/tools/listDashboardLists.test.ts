import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listDashboardLists } from "./listDashboardLists.js";

describe("listDashboardLists", () => {
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
      expect(() => listDashboardLists.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listDashboardLists: fresh } = await import("./listDashboardLists.js");
      await expect(fresh.execute({})).rejects.toThrow("listDashboardLists not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listDashboardLists.initialize();

      const mockResponse = {
        dashboard_lists: [
          {
            id: 123,
            name: "My Dashboard List",
            dashboard_count: 5,
            author: {
              handle: "user@example.com",
              name: "Test User",
            },
            created: "2024-01-01T00:00:00Z",
            modified: "2024-01-02T00:00:00Z",
            type: "manual_dashboard_list",
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await listDashboardLists.execute({});

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://datadoghq.com/api/v1/dashboard/lists/manual",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "DD-API-KEY": "test-api-key",
            "DD-APPLICATION-KEY": "test-app-key",
          },
          body: undefined,
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      listDashboardLists.initialize();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Access denied"] }),
      });

      await expect(listDashboardLists.execute({})).rejects.toThrow();
    });
  });
});

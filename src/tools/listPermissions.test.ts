import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listPermissions } from "./listPermissions.js";

describe("listPermissions", () => {
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
      expect(() => listPermissions.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listPermissions: fresh } = await import("./listPermissions.js");
      await expect(fresh.execute({})).rejects.toThrow("listPermissions not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listPermissions.initialize();
      const mockResponse = {
        data: [
          {
            id: "perm-1",
            type: "permissions",
            attributes: { name: "logs_read", display_name: "Logs Read", group_name: "Logs" },
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listPermissions.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/permissions"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      listPermissions.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listPermissions.execute({})).rejects.toThrow();
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listRoles } from "./listRoles.js";

describe("listRoles", () => {
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
      expect(() => listRoles.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listRoles: fresh } = await import("./listRoles.js");
      await expect(fresh.execute({})).rejects.toThrow("listRoles not initialized");
    });

    it("makes correct API call without params", async () => {
      listRoles.initialize();
      const mockResponse = {
        data: [{ id: "role-1", type: "roles", attributes: { name: "Admin", user_count: 5 } }],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listRoles.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/roles"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes query params when provided", async () => {
      listRoles.initialize();
      const mockResponse = { data: [] };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      await listRoles.execute({ page_size: 10, page_number: 0, filter: "admin" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("page%5Bsize%5D=10"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      listRoles.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listRoles.execute({})).rejects.toThrow();
    });
  });
});

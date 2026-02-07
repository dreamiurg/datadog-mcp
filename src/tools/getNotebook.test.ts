import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getNotebook } from "./getNotebook.js";

describe("getNotebook", () => {
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
      expect(() => getNotebook.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getNotebook: fresh } = await import("./getNotebook.js");
      await expect(fresh.execute({ notebook_id: 123 })).rejects.toThrow(
        "getNotebook not initialized",
      );
    });

    it("makes correct API call and returns results", async () => {
      getNotebook.initialize();
      const mockResponse = {
        data: {
          id: 123,
          type: "notebooks",
          attributes: { name: "Incident Investigation", status: "published" },
        },
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getNotebook.execute({ notebook_id: 123 });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/notebooks/123"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      getNotebook.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({ errors: ["Not Found"] }),
      });
      await expect(getNotebook.execute({ notebook_id: 999 })).rejects.toThrow();
    });
  });
});

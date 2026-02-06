import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPowerpacks } from "./getPowerpacks.js";

describe("getPowerpacks", () => {
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
      expect(() => getPowerpacks.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getPowerpacks: fresh } = await import("./getPowerpacks.js");
      await expect(fresh.execute({})).rejects.toThrow("getPowerpacks not initialized");
    });

    it("makes correct API call without params", async () => {
      getPowerpacks.initialize();
      const mockResponse = {
        data: [
          { id: "pack-1", type: "powerpack", attributes: { name: "Test Pack", tags: ["test"] } },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getPowerpacks.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/powerpacks"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes pagination params when provided", async () => {
      getPowerpacks.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await getPowerpacks.execute({ page_limit: 10, page_offset: 5 });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("page%5Blimit%5D=10"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      getPowerpacks.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(getPowerpacks.execute({})).rejects.toThrow();
    });
  });
});

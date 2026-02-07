import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listApiKeys } from "./listApiKeys.js";

describe("listApiKeys", () => {
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
      expect(() => listApiKeys.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listApiKeys: fresh } = await import("./listApiKeys.js");
      await expect(fresh.execute({})).rejects.toThrow("listApiKeys not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listApiKeys.initialize();
      const mockResponse = {
        data: [{ id: "key-1", type: "api_keys", attributes: { name: "prod-key", last4: "abcd" } }],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listApiKeys.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/api_keys"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes query params when provided", async () => {
      listApiKeys.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await listApiKeys.execute({ page_size: 10, filter: "prod" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("page%5Bsize%5D=10"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      listApiKeys.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listApiKeys.execute({})).rejects.toThrow();
    });
  });
});

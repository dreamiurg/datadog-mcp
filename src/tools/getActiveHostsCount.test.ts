import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getActiveHostsCount } from "./getActiveHostsCount.js";

describe("getActiveHostsCount", () => {
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
      expect(() => getActiveHostsCount.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getActiveHostsCount: fresh } = await import("./getActiveHostsCount.js");
      await expect(fresh.execute({})).rejects.toThrow("getActiveHostsCount not initialized");
    });

    it("gets active hosts count without from parameter", async () => {
      getActiveHostsCount.initialize();
      const mockResponse = { total_active: 42, total_up: 40 };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getActiveHostsCount.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/hosts/totals"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("gets active hosts count with from parameter", async () => {
      getActiveHostsCount.initialize();
      const mockResponse = { total_active: 50, total_up: 48 };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const from = 1640995200; // 2022-01-01 00:00:00 UTC
      const result = await getActiveHostsCount.execute({ from });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/v1/hosts/totals?from=${from}`),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles zero hosts", async () => {
      getActiveHostsCount.initialize();
      const mockResponse = { total_active: 0, total_up: 0 };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getActiveHostsCount.execute({});
      expect(result).toEqual(mockResponse);
    });
  });
});

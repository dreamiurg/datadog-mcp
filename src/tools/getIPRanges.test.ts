import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getIPRanges } from "./getIPRanges.js";

describe("getIPRanges", () => {
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
      expect(() => getIPRanges.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getIPRanges: fresh } = await import("./getIPRanges.js");
      await expect(fresh.execute({})).rejects.toThrow("getIPRanges not initialized");
    });

    it("makes correct API call and returns results", async () => {
      getIPRanges.initialize();
      const mockResponse = {
        agents: { prefixes_ipv4: ["1.2.3.4/32"] },
        api: { prefixes_ipv4: ["5.6.7.8/32"] },
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getIPRanges.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/ip_ranges"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      getIPRanges.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(getIPRanges.execute({})).rejects.toThrow();
    });
  });
});

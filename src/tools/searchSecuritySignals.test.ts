import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { searchSecuritySignals } from "./searchSecuritySignals.js";

describe("searchSecuritySignals", () => {
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
      expect(() => searchSecuritySignals.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { searchSecuritySignals: fresh } = await import("./searchSecuritySignals.js");
      await expect(fresh.execute({})).rejects.toThrow("searchSecuritySignals not initialized");
    });

    it("makes correct API call without params and returns results", async () => {
      searchSecuritySignals.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: [
            {
              id: "signal-1",
              type: "signal",
              attributes: {
                severity: "high",
                status: "open",
              },
            },
          ],
          meta: { page: { after: "cursor-123" } },
        }),
      });

      const result = await searchSecuritySignals.execute({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/security_monitoring/signals/search"),
        expect.objectContaining({
          method: "POST",
          body: "{}",
        }),
      );
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].attributes?.severity).toBe("high");
    });

    it("includes filter, sort, and page parameters when provided", async () => {
      searchSecuritySignals.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [], meta: {} }),
      });

      const params = {
        filter: {
          query: "status:open",
          from: "2024-01-01T00:00:00Z",
          to: "2024-01-31T23:59:59Z",
        },
        sort: "-timestamp",
        page: {
          limit: 100,
          cursor: "abc123",
        },
      };

      await searchSecuritySignals.execute(params);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/security_monitoring/signals/search"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("status:open"),
        }),
      );
    });

    it("handles API errors", async () => {
      searchSecuritySignals.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        text: async () => JSON.stringify({ errors: ["Invalid API key"] }),
        json: async () => ({ errors: ["Invalid API key"] }),
      });

      await expect(searchSecuritySignals.execute({})).rejects.toThrow();
    });
  });
});

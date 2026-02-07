import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { searchAuditLogs } from "./searchAuditLogs.js";

describe("searchAuditLogs", () => {
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
      expect(() => searchAuditLogs.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { searchAuditLogs: fresh } = await import("./searchAuditLogs.js");
      await expect(fresh.execute({})).rejects.toThrow("searchAuditLogs not initialized");
    });

    it("makes correct API call and returns results", async () => {
      searchAuditLogs.initialize();
      const mockResponse = {
        data: [
          {
            id: "event-1",
            type: "audit",
            attributes: { timestamp: "2024-01-01T00:00:00Z", service: "monitors" },
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await searchAuditLogs.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/audit/events/search"),
        expect.objectContaining({ method: "POST" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes filter params in request body", async () => {
      searchAuditLogs.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await searchAuditLogs.execute({ filter_query: "@type:monitor", page_limit: 10 });
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.filter.query).toBe("@type:monitor");
      expect(body.page.limit).toBe(10);
    });

    it("handles API errors", async () => {
      searchAuditLogs.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(searchAuditLogs.execute({})).rejects.toThrow();
    });
  });
});

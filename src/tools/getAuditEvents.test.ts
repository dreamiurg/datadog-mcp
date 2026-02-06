import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAuditEvents } from "./getAuditEvents.js";

describe("getAuditEvents", () => {
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
      expect(() => getAuditEvents.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getAuditEvents: fresh } = await import("./getAuditEvents.js");
      await expect(fresh.execute({})).rejects.toThrow("getAuditEvents not initialized");
    });

    it("makes correct API call and returns results", async () => {
      getAuditEvents.initialize();
      const mockResponse = {
        data: [
          {
            id: "audit-1",
            type: "audit_event",
            attributes: {
              timestamp: "2024-01-01T12:00:00Z",
              service: "datadog",
              type: "user",
              action: "login",
              user: {
                handle: "user@example.com",
                name: "Test User",
              },
              resource_type: "dashboard",
              resource_id: "dashboard-123",
            },
          },
        ],
        meta: {
          page: {
            after: "cursor-456",
          },
        },
        links: {
          next: "https://api.datadoghq.com/api/v2/audit/events/search?cursor=next",
        },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getAuditEvents.execute({
        filter: { query: "action:login", from: "now-24h", to: "now" },
        sort: "-timestamp",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/audit/events/search"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("action:login"),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("applies client-side limit truncation", async () => {
      getAuditEvents.initialize();
      const mockResponse = {
        data: [
          { id: "1", attributes: { action: "login" } },
          { id: "2", attributes: { action: "logout" } },
          { id: "3", attributes: { action: "create" } },
          { id: "4", attributes: { action: "delete" } },
          { id: "5", attributes: { action: "update" } },
        ],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getAuditEvents.execute({ limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].id).toBe("1");
      expect(result.data?.[1].id).toBe("2");
    });

    it("handles pagination parameters", async () => {
      getAuditEvents.initialize();
      const mockResponse = { data: [], meta: { page: { after: "cursor-789" } } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getAuditEvents.execute({
        page: { limit: 50, cursor: "cursor-abc" },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/audit/events/search"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("cursor-abc"),
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });
});

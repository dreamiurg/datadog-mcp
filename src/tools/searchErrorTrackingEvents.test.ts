import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { searchErrorTrackingEvents } from "./searchErrorTrackingEvents.js";

describe("searchErrorTrackingEvents", () => {
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
      expect(() => searchErrorTrackingEvents.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { searchErrorTrackingEvents: fresh } = await import("./searchErrorTrackingEvents.js");
      await expect(fresh.execute({})).rejects.toThrow("searchErrorTrackingEvents not initialized");
    });

    it("makes correct API call and returns results", async () => {
      searchErrorTrackingEvents.initialize();
      const mockResponse = {
        data: [
          {
            id: "error-1",
            type: "error_tracking_event",
            attributes: {
              title: "NullPointerException",
              message: "Object reference not set",
              error_type: "RuntimeException",
              service: "web-app",
              env: "production",
              first_seen: "2024-01-01T00:00:00Z",
              last_seen: "2024-01-02T00:00:00Z",
              count: 42,
            },
          },
        ],
        meta: {
          page: {
            after: "cursor-123",
          },
        },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await searchErrorTrackingEvents.execute({
        filter: { query: "service:web-app", from: "now-1h", to: "now" },
        sort: "-timestamp",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/error-tracking/events/search"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("service:web-app"),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("applies client-side limit truncation", async () => {
      searchErrorTrackingEvents.initialize();
      const mockResponse = {
        data: [
          { id: "1", attributes: { title: "Error 1" } },
          { id: "2", attributes: { title: "Error 2" } },
          { id: "3", attributes: { title: "Error 3" } },
          { id: "4", attributes: { title: "Error 4" } },
          { id: "5", attributes: { title: "Error 5" } },
        ],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await searchErrorTrackingEvents.execute({ limit: 3 });

      expect(result.data).toHaveLength(3);
      expect(result.data?.[0].id).toBe("1");
      expect(result.data?.[2].id).toBe("3");
    });

    it("handles empty filter params correctly", async () => {
      searchErrorTrackingEvents.initialize();
      const mockResponse = { data: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await searchErrorTrackingEvents.execute({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/error-tracking/events/search"),
        expect.objectContaining({ method: "POST" }),
      );
      expect(result).toEqual(mockResponse);
    });
  });
});

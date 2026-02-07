import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { searchErrorTrackingIssues } from "./searchErrorTrackingIssues.js";

describe("searchErrorTrackingIssues", () => {
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
      expect(() => searchErrorTrackingIssues.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { searchErrorTrackingIssues: fresh } = await import("./searchErrorTrackingIssues.js");
      await expect(fresh.execute({})).rejects.toThrow("searchErrorTrackingIssues not initialized");
    });

    it("makes correct API call and returns results", async () => {
      searchErrorTrackingIssues.initialize();
      const mockResponse = {
        data: [
          {
            id: "err-1",
            type: "error_tracking_issue",
            attributes: { title: "NullPointerException", status: "open", count: 42 },
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await searchErrorTrackingIssues.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/error_tracking/issues/search"),
        expect.objectContaining({ method: "POST" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes filter params in request body", async () => {
      searchErrorTrackingIssues.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await searchErrorTrackingIssues.execute({
        filter_query: "service:web",
        page_limit: 10,
      });
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.filter.query).toBe("service:web");
      expect(body.page.limit).toBe(10);
    });

    it("handles API errors", async () => {
      searchErrorTrackingIssues.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(searchErrorTrackingIssues.execute({})).rejects.toThrow();
    });
  });
});

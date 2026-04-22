import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getErrorTrackingIssue } from "./getErrorTrackingIssue.js";

describe("getErrorTrackingIssue", () => {
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
      expect(() => getErrorTrackingIssue.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getErrorTrackingIssue: fresh } = await import("./getErrorTrackingIssue.js");
      await expect(fresh.execute({ issue_id: "abc123" })).rejects.toThrow(
        "getErrorTrackingIssue not initialized",
      );
    });

    it("makes correct API call and returns results", async () => {
      getErrorTrackingIssue.initialize();
      const mockResponse = {
        data: {
          id: "abc123",
          type: "error_tracking_issue",
          attributes: {
            title: "NullPointerException",
            status: "open",
            count: 42,
          },
        },
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getErrorTrackingIssue.execute({ issue_id: "abc123" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/error-tracking/issues/abc123"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("url-encodes issue_id with special characters", async () => {
      getErrorTrackingIssue.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: {} }) });
      await getErrorTrackingIssue.execute({ issue_id: "issue/with:special" });
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("/api/v2/error-tracking/issues/issue%2Fwith%3Aspecial");
    });

    it("handles API errors", async () => {
      getErrorTrackingIssue.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({ errors: ["Not Found"] }),
      });
      await expect(getErrorTrackingIssue.execute({ issue_id: "missing" })).rejects.toThrow();
    });
  });
});

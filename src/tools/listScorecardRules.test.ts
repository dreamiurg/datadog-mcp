import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listScorecardRules } from "./listScorecardRules.js";

describe("listScorecardRules", () => {
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
      expect(() => listScorecardRules.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listScorecardRules: fresh } = await import("./listScorecardRules.js");
      await expect(fresh.execute({})).rejects.toThrow("listScorecardRules not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listScorecardRules.initialize();
      const mockResponse = {
        data: [
          {
            id: "rule-1",
            type: "scorecard_rule",
            attributes: { name: "Test Rule", enabled: true, category: "performance" },
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listScorecardRules.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/scorecard/rules"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes query params when provided", async () => {
      listScorecardRules.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await listScorecardRules.execute({ page_size: 10, filter_rule_name: "Test" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("page%5Bsize%5D=10"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      listScorecardRules.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listScorecardRules.execute({})).rejects.toThrow();
    });
  });
});

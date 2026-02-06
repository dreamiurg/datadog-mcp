import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listScorecardOutcomes } from "./listScorecardOutcomes.js";

describe("listScorecardOutcomes", () => {
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
      expect(() => listScorecardOutcomes.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listScorecardOutcomes: fresh } = await import("./listScorecardOutcomes.js");
      await expect(fresh.execute({})).rejects.toThrow("listScorecardOutcomes not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listScorecardOutcomes.initialize();
      const mockResponse = {
        data: [
          {
            id: "outcome-1",
            type: "scorecard_outcome",
            attributes: { rule_id: "rule-1", service_name: "web", state: "pass" },
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listScorecardOutcomes.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/scorecard/outcomes"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes query params when provided", async () => {
      listScorecardOutcomes.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await listScorecardOutcomes.execute({ page_size: 10, filter_service_name: "web" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("filter%5Bservice_name%5D=web"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      listScorecardOutcomes.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listScorecardOutcomes.execute({})).rejects.toThrow();
    });
  });
});

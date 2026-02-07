import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getEstimatedCost } from "./getEstimatedCost.js";

describe("getEstimatedCost", () => {
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
      expect(() => getEstimatedCost.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getEstimatedCost: fresh } = await import("./getEstimatedCost.js");
      await expect(fresh.execute({})).rejects.toThrow("getEstimatedCost not initialized");
    });

    it("makes correct API call and returns results", async () => {
      getEstimatedCost.initialize();
      const mockResponse = {
        data: [{ id: "cost-1", type: "cost", attributes: { total_cost: 1234.56 } }],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getEstimatedCost.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/usage/estimated_cost"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes date params when provided", async () => {
      getEstimatedCost.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await getEstimatedCost.execute({ view: "sub-org", start_month: "2025-01" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("start_month=2025-01"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      getEstimatedCost.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(getEstimatedCost.execute({})).rejects.toThrow();
    });
  });
});

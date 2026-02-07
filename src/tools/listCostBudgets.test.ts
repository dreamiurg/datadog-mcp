import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listCostBudgets } from "./listCostBudgets.js";

describe("listCostBudgets", () => {
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
      expect(() => listCostBudgets.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listCostBudgets: fresh } = await import("./listCostBudgets.js");
      await expect(fresh.execute({})).rejects.toThrow("listCostBudgets not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listCostBudgets.initialize();
      const mockResponse = {
        data: [
          { id: "budget-1", type: "cost_budget", attributes: { name: "Team Alpha", amount: 5000 } },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listCostBudgets.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/cost/budgets"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes pagination params when provided", async () => {
      listCostBudgets.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await listCostBudgets.execute({ page_size: 20 });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("page%5Bsize%5D=20"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      listCostBudgets.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listCostBudgets.execute({})).rejects.toThrow();
    });
  });
});

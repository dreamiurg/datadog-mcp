import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listLogsMetrics } from "./listLogsMetrics.js";

describe("listLogsMetrics", () => {
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
      expect(() => listLogsMetrics.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listLogsMetrics: fresh } = await import("./listLogsMetrics.js");
      await expect(fresh.execute({})).rejects.toThrow("listLogsMetrics not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listLogsMetrics.initialize();
      const mockResponse = {
        data: [{ id: "metric-1", type: "logs_metric", attributes: { filter: { query: "*" } } }],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listLogsMetrics.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/logs/config/metrics"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      listLogsMetrics.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listLogsMetrics.execute({})).rejects.toThrow();
    });
  });
});

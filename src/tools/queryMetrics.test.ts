import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { queryMetrics } from "./queryMetrics.js";

describe("queryMetrics", () => {
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
      expect(() => queryMetrics.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { queryMetrics: fresh } = await import("./queryMetrics.js");
      await expect(
        fresh.execute({ query: "avg:system.cpu.user", from: 1000, to: 2000 }),
      ).rejects.toThrow("queryMetrics not initialized");
    });

    it("queries metrics with parameters and returns results", async () => {
      queryMetrics.initialize();
      const mockResponse = {
        status: "ok",
        series: [
          {
            metric: "system.cpu.user",
            pointlist: [
              [1000, 0.5],
              [2000, 0.6],
            ],
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await queryMetrics.execute({
        query: "avg:system.cpu.user{host:web-1}",
        from: 1000,
        to: 2000,
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/query?from=1000&to=2000&query="),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("properly encodes query parameter", async () => {
      queryMetrics.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: "ok", series: [] }),
      });
      await queryMetrics.execute({
        query: "avg:system.cpu.user{host:web-1,env:prod}",
        from: 1000,
        to: 2000,
      });
      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain(encodeURIComponent("avg:system.cpu.user{host:web-1,env:prod}"));
    });
  });
});

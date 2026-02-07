import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getHourlyUsage } from "./getHourlyUsage.js";

describe("getHourlyUsage", () => {
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
      expect(() => getHourlyUsage.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getHourlyUsage: fresh } = await import("./getHourlyUsage.js");
      await expect(
        fresh.execute({
          filter_timestamp_start: "2024-01-01T00:00:00Z",
          filter_product_families: "infra_hosts",
        }),
      ).rejects.toThrow("getHourlyUsage not initialized");
    });

    it("makes correct API call with required params", async () => {
      getHourlyUsage.initialize();
      const mockResponse = {
        data: [{ id: "usage-1", type: "usage", attributes: { product_family: "infra_hosts" } }],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getHourlyUsage.execute({
        filter_timestamp_start: "2024-01-01T00:00:00Z",
        filter_product_families: "infra_hosts",
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/usage/hourly_usage"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes optional params when provided", async () => {
      getHourlyUsage.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await getHourlyUsage.execute({
        filter_timestamp_start: "2024-01-01T00:00:00Z",
        filter_product_families: "infra_hosts",
        page_limit: 50,
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("page%5Blimit%5D=50"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      getHourlyUsage.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(
        getHourlyUsage.execute({
          filter_timestamp_start: "2024-01-01T00:00:00Z",
          filter_product_families: "infra_hosts",
        }),
      ).rejects.toThrow();
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getUsage } from "./getUsage.js";

describe("getUsage", () => {
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
      expect(() => getUsage.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getUsage: fresh } = await import("./getUsage.js");
      await expect(fresh.execute({ startHr: "2024-01-01T00:00:00+00:00" })).rejects.toThrow(
        "getUsage not initialized",
      );
    });

    it("fetches usage with required startHr parameter", async () => {
      getUsage.initialize();
      const mockResponse = { data: [{ id: "1", type: "usage_timeseries", attributes: {} }] };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getUsage.execute({ startHr: "2024-01-01T00:00:00+00:00" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/usage/hourly_usage?filter[timestamp][start]="),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes all optional parameters when provided", async () => {
      getUsage.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await getUsage.execute({
        startHr: "2024-01-01T00:00:00+00:00",
        endHr: "2024-01-02T00:00:00+00:00",
        productFamilies: "infra_hosts,logs,apm",
        pageLimit: 100,
        pageNextRecordId: "cursor-123",
      });
      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain("filter[timestamp][start]=");
      expect(callUrl).toContain("filter[timestamp][end]=");
      expect(callUrl).toContain("filter[product_families]=");
      expect(callUrl).toContain("page[limit]=100");
      expect(callUrl).toContain("page[next_record_id]=");
    });

    it("properly encodes timestamp parameters", async () => {
      getUsage.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      const startHr = "2024-01-01T00:00:00+00:00";
      await getUsage.execute({ startHr });
      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain(encodeURIComponent(startHr));
    });
  });
});

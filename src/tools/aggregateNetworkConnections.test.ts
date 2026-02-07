import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { aggregateNetworkConnections } from "./aggregateNetworkConnections.js";

describe("aggregateNetworkConnections", () => {
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
      expect(() => aggregateNetworkConnections.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { aggregateNetworkConnections: fresh } = await import(
        "./aggregateNetworkConnections.js"
      );
      await expect(fresh.execute({})).rejects.toThrow(
        "aggregateNetworkConnections not initialized",
      );
    });

    it("makes correct API call and returns results", async () => {
      aggregateNetworkConnections.initialize();
      const mockResponse = {
        data: [{ id: "agg-1", type: "network_aggregation", attributes: { bytes_sent: 1024 } }],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await aggregateNetworkConnections.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/network/analytics/aggregate/connections"),
        expect.objectContaining({ method: "POST" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes filter and group_by in request body", async () => {
      aggregateNetworkConnections.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await aggregateNetworkConnections.execute({
        filter_query: "service:web",
        group_by: ["source_service", "dest_service"],
      });
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.filter.query).toBe("service:web");
      expect(body.group_by).toEqual(["source_service", "dest_service"]);
    });

    it("handles API errors", async () => {
      aggregateNetworkConnections.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(aggregateNetworkConnections.execute({})).rejects.toThrow();
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getMonitorConfigPolicies } from "./getMonitorConfigPolicies.js";

describe("getMonitorConfigPolicies", () => {
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
      expect(() => getMonitorConfigPolicies.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getMonitorConfigPolicies: fresh } = await import("./getMonitorConfigPolicies.js");
      await expect(fresh.execute({})).rejects.toThrow("getMonitorConfigPolicies not initialized");
    });

    it("makes correct API call and returns results", async () => {
      getMonitorConfigPolicies.initialize();
      const mockResponse = {
        data: [{ id: "pol-1", type: "monitor_config_policy", attributes: { policy_type: "tag" } }],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getMonitorConfigPolicies.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/monitor/policy"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      getMonitorConfigPolicies.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(getMonitorConfigPolicies.execute({})).rejects.toThrow();
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getServiceDependencies } from "./getServiceDependencies.js";

describe("getServiceDependencies", () => {
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
      expect(() => getServiceDependencies.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getServiceDependencies: fresh } = await import("./getServiceDependencies.js");
      await expect(fresh.execute({ env: "prod" })).rejects.toThrow(
        "getServiceDependencies not initialized",
      );
    });

    it("makes correct API call with env param", async () => {
      getServiceDependencies.initialize();
      const mockResponse = {
        data: [
          {
            id: "svc-1",
            type: "service_dependencies",
            attributes: { service: "web-app", dependencies: ["db", "cache"] },
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getServiceDependencies.execute({ env: "production" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/services/dependencies?env=production"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      getServiceDependencies.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(getServiceDependencies.execute({ env: "prod" })).rejects.toThrow();
    });
  });
});

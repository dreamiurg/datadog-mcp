import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getServices } from "./getServices.js";

describe("getServices", () => {
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
      expect(() => getServices.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getServices: freshGetServices } = await import("./getServices.js");

      await expect(freshGetServices.execute({})).rejects.toThrow("getServices not initialized");
    });

    it("fetches services and flattens nested response", async () => {
      getServices.initialize();

      // API returns nested format: { serviceName: { env1: {}, env2: {} } }
      const mockApiResponse = {
        "api-gateway": { production: {}, staging: {} },
        "user-service": { production: {} },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      const result = await getServices.execute({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/services"),
        expect.objectContaining({ method: "GET" }),
      );

      // Should be flattened to array of { name, env }
      expect(result?.services).toEqual([
        { name: "api-gateway", env: "production" },
        { name: "api-gateway", env: "staging" },
        { name: "user-service", env: "production" },
      ]);
    });

    it("passes env filter as query parameter", async () => {
      getServices.initialize();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await getServices.execute({ env: "production" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("env=production"),
        expect.any(Object),
      );
    });
  });
});

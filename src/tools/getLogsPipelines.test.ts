import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLogsPipelines } from "./getLogsPipelines.js";

describe("getLogsPipelines", () => {
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
      expect(() => getLogsPipelines.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getLogsPipelines: fresh } = await import("./getLogsPipelines.js");
      await expect(fresh.execute({})).rejects.toThrow("getLogsPipelines not initialized");
    });

    it("makes correct API call and returns array", async () => {
      getLogsPipelines.initialize();
      const mockResponse = [
        {
          id: "pipeline-1",
          name: "Main Pipeline",
          is_enabled: true,
          filter: { query: "source:web" },
          type: "pipeline",
        },
      ];
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getLogsPipelines.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/logs/config/pipelines"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      getLogsPipelines.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(getLogsPipelines.execute({})).rejects.toThrow();
    });
  });
});

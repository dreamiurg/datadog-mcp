import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLogPipelines } from "./getLogPipelines.js";

describe("getLogPipelines", () => {
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
      expect(() => getLogPipelines.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getLogPipelines: fresh } = await import("./getLogPipelines.js");
      await expect(fresh.execute({})).rejects.toThrow("getLogPipelines not initialized");
    });

    it("makes correct API call and returns results", async () => {
      getLogPipelines.initialize();
      const mockResponse = [
        {
          id: "pipeline-1",
          name: "Test Pipeline",
          type: "pipeline",
          is_enabled: true,
          filter: { query: "source:nginx" },
          processors: [],
          is_read_only: false,
        },
      ];
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getLogPipelines.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/logs/config/pipelines"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });
  });
});

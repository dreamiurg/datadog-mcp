import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLogsPipelineOrder } from "./getLogsPipelineOrder.js";

describe("getLogsPipelineOrder", () => {
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
      expect(() => getLogsPipelineOrder.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getLogsPipelineOrder: fresh } = await import("./getLogsPipelineOrder.js");
      await expect(fresh.execute({})).rejects.toThrow("getLogsPipelineOrder not initialized");
    });

    it("makes correct API call and returns results", async () => {
      getLogsPipelineOrder.initialize();
      const mockResponse = { pipeline_ids: ["pipe-1", "pipe-2", "pipe-3"] };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getLogsPipelineOrder.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/logs/config/pipeline-order"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      getLogsPipelineOrder.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(getLogsPipelineOrder.execute({})).rejects.toThrow();
    });
  });
});

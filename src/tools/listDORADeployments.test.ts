import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listDORADeployments } from "./listDORADeployments.js";

describe("listDORADeployments", () => {
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
      expect(() => listDORADeployments.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listDORADeployments: fresh } = await import("./listDORADeployments.js");
      await expect(fresh.execute({})).rejects.toThrow("listDORADeployments not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listDORADeployments.initialize();
      const mockResponse = {
        data: [
          {
            id: "dep-1",
            type: "dora_deployment",
            attributes: { service: "web", status: "success" },
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listDORADeployments.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/dora/deployments"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes filter params when provided", async () => {
      listDORADeployments.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await listDORADeployments.execute({ filter_service: "web", filter_env: "production" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("filter%5Bservice%5D=web"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      listDORADeployments.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listDORADeployments.execute({})).rejects.toThrow();
    });
  });
});

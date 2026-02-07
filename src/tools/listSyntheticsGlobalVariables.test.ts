import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listSyntheticsGlobalVariables } from "./listSyntheticsGlobalVariables.js";

describe("listSyntheticsGlobalVariables", () => {
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
      expect(() => listSyntheticsGlobalVariables.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listSyntheticsGlobalVariables: fresh } = await import(
        "./listSyntheticsGlobalVariables.js"
      );
      await expect(fresh.execute({})).rejects.toThrow(
        "listSyntheticsGlobalVariables not initialized",
      );
    });

    it("makes correct API call and returns results", async () => {
      listSyntheticsGlobalVariables.initialize();
      const mockResponse = {
        variables: [{ id: "var-1", name: "API_KEY", description: "Test API key" }],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listSyntheticsGlobalVariables.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/synthetics/variables"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      listSyntheticsGlobalVariables.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listSyntheticsGlobalVariables.execute({})).rejects.toThrow();
    });
  });
});

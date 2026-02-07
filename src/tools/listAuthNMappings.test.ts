import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listAuthNMappings } from "./listAuthNMappings.js";

describe("listAuthNMappings", () => {
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
      expect(() => listAuthNMappings.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listAuthNMappings: fresh } = await import("./listAuthNMappings.js");
      await expect(fresh.execute({})).rejects.toThrow("listAuthNMappings not initialized");
    });

    it("makes correct API call", async () => {
      listAuthNMappings.initialize();
      const mockResponse = { data: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });
      const result = await listAuthNMappings.execute({});
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain("/api/v2/authn_mappings");
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      listAuthNMappings.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        text: async () => "Access denied",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listAuthNMappings.execute({})).rejects.toThrow();
    });
  });
});

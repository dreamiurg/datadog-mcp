import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listSyntheticsLocations } from "./listSyntheticsLocations.js";

describe("listSyntheticsLocations", () => {
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
      expect(() => listSyntheticsLocations.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listSyntheticsLocations: fresh } = await import("./listSyntheticsLocations.js");
      await expect(fresh.execute({})).rejects.toThrow("listSyntheticsLocations not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listSyntheticsLocations.initialize();
      const mockResponse = {
        locations: [{ id: 1, name: "aws:us-east-1", region: "Americas" }],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listSyntheticsLocations.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/synthetics/locations"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      listSyntheticsLocations.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listSyntheticsLocations.execute({})).rejects.toThrow();
    });
  });
});

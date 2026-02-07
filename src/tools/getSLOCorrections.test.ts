import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSLOCorrections } from "./getSLOCorrections.js";

describe("getSLOCorrections", () => {
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
      expect(() => getSLOCorrections.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getSLOCorrections: fresh } = await import("./getSLOCorrections.js");
      await expect(fresh.execute({})).rejects.toThrow("getSLOCorrections not initialized");
    });

    it("makes correct API call and returns results", async () => {
      getSLOCorrections.initialize();
      const mockResponse = {
        data: [{ id: "corr-1", type: "correction", attributes: { category: "deployment" } }],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getSLOCorrections.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/slo/correction"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes pagination params when provided", async () => {
      getSLOCorrections.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await getSLOCorrections.execute({ limit: 10, offset: 5 });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("limit=10"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      getSLOCorrections.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(getSLOCorrections.execute({})).rejects.toThrow();
    });
  });
});

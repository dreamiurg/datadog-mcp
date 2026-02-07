import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listNotebooks } from "./listNotebooks.js";

describe("listNotebooks", () => {
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
      expect(() => listNotebooks.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listNotebooks: fresh } = await import("./listNotebooks.js");
      await expect(fresh.execute({})).rejects.toThrow("listNotebooks not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listNotebooks.initialize();
      const mockResponse = {
        data: [{ id: 1, type: "notebooks", attributes: { name: "Incident Investigation" } }],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listNotebooks.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/notebooks"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes query params when provided", async () => {
      listNotebooks.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await listNotebooks.execute({ query: "incident", count: 10 });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("query=incident"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      listNotebooks.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listNotebooks.execute({})).rejects.toThrow();
    });
  });
});

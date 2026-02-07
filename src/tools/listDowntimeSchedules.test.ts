import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listDowntimeSchedules } from "./listDowntimeSchedules.js";

describe("listDowntimeSchedules", () => {
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
      expect(() => listDowntimeSchedules.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listDowntimeSchedules: fresh } = await import("./listDowntimeSchedules.js");
      await expect(fresh.execute({})).rejects.toThrow("listDowntimeSchedules not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listDowntimeSchedules.initialize();
      const mockResponse = {
        data: [
          { id: "dt-1", type: "downtime", attributes: { status: "active", scope: "env:prod" } },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listDowntimeSchedules.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/downtime"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes params when provided", async () => {
      listDowntimeSchedules.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await listDowntimeSchedules.execute({ current_only: true, page_limit: 10 });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("current_only=true"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      listDowntimeSchedules.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listDowntimeSchedules.execute({})).rejects.toThrow();
    });
  });
});

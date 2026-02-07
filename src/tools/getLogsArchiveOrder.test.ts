import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLogsArchiveOrder } from "./getLogsArchiveOrder.js";

describe("getLogsArchiveOrder", () => {
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
      expect(() => getLogsArchiveOrder.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getLogsArchiveOrder: fresh } = await import("./getLogsArchiveOrder.js");
      await expect(fresh.execute({})).rejects.toThrow("getLogsArchiveOrder not initialized");
    });

    it("makes correct API call and returns results", async () => {
      getLogsArchiveOrder.initialize();
      const mockResponse = {
        data: { type: "archive_order", attributes: { archive_ids: ["arch-1", "arch-2"] } },
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getLogsArchiveOrder.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/logs/config/archive-order"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      getLogsArchiveOrder.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(getLogsArchiveOrder.execute({})).rejects.toThrow();
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLogsArchives } from "./getLogsArchives.js";

describe("getLogsArchives", () => {
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
      expect(() => getLogsArchives.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getLogsArchives: fresh } = await import("./getLogsArchives.js");
      await expect(fresh.execute({})).rejects.toThrow("getLogsArchives not initialized");
    });

    it("makes correct API call and returns results", async () => {
      getLogsArchives.initialize();
      const mockResponse = {
        data: [
          {
            id: "archive-1",
            type: "archives",
            attributes: { name: "S3 Archive", query: "*", state: "UNKNOWN" },
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getLogsArchives.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/logs/config/archives"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      getLogsArchives.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(getLogsArchives.execute({})).rejects.toThrow();
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getHostTags } from "./getHostTags.js";

describe("getHostTags", () => {
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
      expect(() => getHostTags.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getHostTags: fresh } = await import("./getHostTags.js");
      await expect(fresh.execute({})).rejects.toThrow("getHostTags not initialized");
    });

    it("makes correct API call and returns results", async () => {
      getHostTags.initialize();
      const mockResponse = {
        tags: {
          "env:prod": ["host1", "host2"],
          "service:web": ["host1"],
          "team:backend": ["host2"],
        },
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });

      const result = await getHostTags.execute({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/tags/hosts"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles source parameter", async () => {
      getHostTags.initialize();
      const mockResponse = { tags: {} };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });

      await getHostTags.execute({ source: "datadog-agent" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("source=datadog-agent"),
        expect.anything(),
      );
    });

    it("does not add query string when no source provided", async () => {
      getHostTags.initialize();
      const mockResponse = { tags: {} };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });

      await getHostTags.execute({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/tags/hosts"),
        expect.anything(),
      );
    });
  });
});

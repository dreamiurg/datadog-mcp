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
      await expect(fresh.execute({ host_name: "myhost" })).rejects.toThrow(
        "getHostTags not initialized",
      );
    });

    it("makes correct API call and returns results", async () => {
      getHostTags.initialize();
      const mockResponse = { tags: ["env:prod", "service:web", "team:backend"] };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getHostTags.execute({ host_name: "web-server-01" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/tags/hosts/web-server-01"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes source param when provided", async () => {
      getHostTags.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ tags: [] }) });
      await getHostTags.execute({ host_name: "myhost", source: "datadog-agent" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("source=datadog-agent"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      getHostTags.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({ errors: ["Not Found"] }),
      });
      await expect(getHostTags.execute({ host_name: "unknown" })).rejects.toThrow();
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSyntheticTests } from "./getSyntheticTests.js";

describe("getSyntheticTests", () => {
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
      expect(() => getSyntheticTests.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getSyntheticTests: fresh } = await import("./getSyntheticTests.js");
      await expect(fresh.execute({})).rejects.toThrow("getSyntheticTests not initialized");
    });

    it("fetches synthetic tests successfully", async () => {
      getSyntheticTests.initialize();
      const mockResponse = {
        tests: [
          { public_id: "abc-123", name: "Test API", type: "api", status: "live" },
          { public_id: "def-456", name: "Test Browser", type: "browser", status: "paused" },
        ],
        meta: { page: { total_count: 2 } },
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getSyntheticTests.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/synthetics/tests"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("builds query parameters correctly", async () => {
      getSyntheticTests.initialize();
      const mockResponse = { tests: [{ public_id: "abc-123" }] };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      await getSyntheticTests.execute({
        pageSize: 50,
        pageNumber: 2,
        type: "api",
        locations: "us-east-1",
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("page_size=50"),
        expect.anything(),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("page_number=2"),
        expect.anything(),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("type=api"),
        expect.anything(),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("locations=us-east-1"),
        expect.anything(),
      );
    });

    it("handles pagination parameters", async () => {
      getSyntheticTests.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ tests: [] }) });
      await getSyntheticTests.execute({ pageSize: 10, pageNumber: 1 });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/page_size=10.*page_number=1/),
        expect.anything(),
      );
    });
  });
});

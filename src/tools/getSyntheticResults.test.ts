import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSyntheticResults } from "./getSyntheticResults.js";

describe("getSyntheticResults", () => {
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
      expect(() => getSyntheticResults.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getSyntheticResults: fresh } = await import("./getSyntheticResults.js");
      await expect(fresh.execute({ publicId: "abc-123" })).rejects.toThrow(
        "getSyntheticResults not initialized",
      );
    });

    it("fetches synthetic results successfully", async () => {
      getSyntheticResults.initialize();
      const mockResponse = {
        results: [
          { result_id: "result-1", status: 0, check_time: 1234567890, probe_dc: "us-east-1" },
          { result_id: "result-2", status: 1, check_time: 1234567900, probe_dc: "eu-west-1" },
        ],
        last_timestamp_fetched: 1234567900,
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getSyntheticResults.execute({ publicId: "abc-123" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/synthetics/tests/abc-123/results"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("builds query parameters with timestamps", async () => {
      getSyntheticResults.initialize();
      const mockResponse = { results: [] };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      await getSyntheticResults.execute({ publicId: "test-id", fromTs: 1000000, toTs: 2000000 });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("from_ts=1000000"),
        expect.anything(),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("to_ts=2000000"),
        expect.anything(),
      );
    });

    it("handles probe_dc array parameter", async () => {
      getSyntheticResults.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ results: [] }) });
      await getSyntheticResults.execute({
        publicId: "test-id",
        probeDc: ["us-east-1", "eu-west-1"],
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("probe_dc=us-east-1"),
        expect.anything(),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("probe_dc=eu-west-1"),
        expect.anything(),
      );
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSloHistory } from "./getSloHistory.js";

describe("getSloHistory", () => {
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
      expect(() => getSloHistory.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getSloHistory: fresh } = await import("./getSloHistory.js");
      await expect(fresh.execute({ sloId: "slo-123", fromTs: 1000, toTs: 2000 })).rejects.toThrow(
        "getSloHistory not initialized",
      );
    });

    it("fetches SLO history with required parameters", async () => {
      getSloHistory.initialize();
      const mockResponse = { data: { from_ts: 1000, to_ts: 2000, overall: { sli_value: 99.5 } } };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getSloHistory.execute({ sloId: "slo-123", fromTs: 1000, toTs: 2000 });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/slo/slo-123/history?from_ts=1000&to_ts=2000"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes target parameter when provided", async () => {
      getSloHistory.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: {} }) });
      await getSloHistory.execute({ sloId: "slo-123", fromTs: 1000, toTs: 2000, target: 99.9 });
      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain("target=99.9");
    });

    it("properly encodes sloId in URL", async () => {
      getSloHistory.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: {} }) });
      await getSloHistory.execute({ sloId: "slo/special-123", fromTs: 1000, toTs: 2000 });
      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain(encodeURIComponent("slo/special-123"));
    });
  });
});

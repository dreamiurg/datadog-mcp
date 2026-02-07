import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getIncidentTimeline } from "./getIncidentTimeline.js";

describe("getIncidentTimeline", () => {
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
      expect(() => getIncidentTimeline.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getIncidentTimeline: fresh } = await import("./getIncidentTimeline.js");
      await expect(fresh.execute({ incidentId: "test-id" })).rejects.toThrow(
        "getIncidentTimeline not initialized",
      );
    });

    it("makes correct API call", async () => {
      getIncidentTimeline.initialize();
      const mockResponse = { data: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });
      const result = await getIncidentTimeline.execute({
        incidentId: "test-id",
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0][0];
      expect(call).toContain("/api/v2/incidents/test-id/timeline");
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      getIncidentTimeline.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        text: async () => "Access denied",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(getIncidentTimeline.execute({ incidentId: "test-id" })).rejects.toThrow();
    });
  });
});

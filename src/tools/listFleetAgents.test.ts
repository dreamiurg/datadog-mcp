import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listFleetAgents } from "./listFleetAgents.js";

describe("listFleetAgents", () => {
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
      expect(() => listFleetAgents.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listFleetAgents: fresh } = await import("./listFleetAgents.js");
      await expect(fresh.execute({})).rejects.toThrow("listFleetAgents not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listFleetAgents.initialize();
      const mockResponse = {
        data: [
          {
            id: "agent-1",
            type: "fleet_agent",
            attributes: { hostname: "web-01", agent_version: "7.50.0" },
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listFleetAgents.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/fleet/agents"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes filter params when provided", async () => {
      listFleetAgents.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await listFleetAgents.execute({ filter_query: "os:linux", page_size: 10 });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("filter%5Bquery%5D=os%3Alinux"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      listFleetAgents.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listFleetAgents.execute({})).rejects.toThrow();
    });
  });
});

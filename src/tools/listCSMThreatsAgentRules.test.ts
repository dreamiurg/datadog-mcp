import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listCSMThreatsAgentRules } from "./listCSMThreatsAgentRules.js";

describe("listCSMThreatsAgentRules", () => {
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
      expect(() => listCSMThreatsAgentRules.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listCSMThreatsAgentRules: fresh } = await import("./listCSMThreatsAgentRules.js");
      await expect(fresh.execute({})).rejects.toThrow("listCSMThreatsAgentRules not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listCSMThreatsAgentRules.initialize();
      const mockResponse = {
        data: [
          {
            id: "rule-1",
            type: "agent_rule",
            attributes: { name: "File integrity check", enabled: true },
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listCSMThreatsAgentRules.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/csm/threats/agent_rules"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes pagination params when provided", async () => {
      listCSMThreatsAgentRules.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await listCSMThreatsAgentRules.execute({ page_size: 10 });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("page%5Bsize%5D=10"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      listCSMThreatsAgentRules.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listCSMThreatsAgentRules.execute({})).rejects.toThrow();
    });
  });
});

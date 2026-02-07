import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listTeamMembers } from "./listTeamMembers.js";

describe("listTeamMembers", () => {
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
      expect(() => listTeamMembers.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listTeamMembers: fresh } = await import("./listTeamMembers.js");
      await expect(fresh.execute({ teamId: "team-123" })).rejects.toThrow(
        "listTeamMembers not initialized",
      );
    });

    it("makes correct API call", async () => {
      listTeamMembers.initialize();
      const mockResponse = { data: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });
      const result = await listTeamMembers.execute({ teamId: "team-123" });
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0][0];
      expect(call).toContain("/api/v2/team/team-123/members");
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      listTeamMembers.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        text: async () => "Access denied",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listTeamMembers.execute({ teamId: "team-123" })).rejects.toThrow();
    });
  });
});

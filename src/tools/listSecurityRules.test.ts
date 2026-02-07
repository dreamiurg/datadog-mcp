import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listSecurityRules } from "./listSecurityRules.js";

describe("listSecurityRules", () => {
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
      expect(() => listSecurityRules.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listSecurityRules: fresh } = await import("./listSecurityRules.js");
      await expect(fresh.execute({})).rejects.toThrow("listSecurityRules not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listSecurityRules.initialize();
      const mockResponse = {
        data: [
          {
            id: "rule-1",
            type: "security_rule",
            attributes: { name: "SSH Brute Force", is_enabled: true },
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listSecurityRules.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/security_monitoring/rules"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes query params when provided", async () => {
      listSecurityRules.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await listSecurityRules.execute({ page_size: 10 });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("page%5Bsize%5D=10"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      listSecurityRules.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listSecurityRules.execute({})).rejects.toThrow();
    });
  });
});

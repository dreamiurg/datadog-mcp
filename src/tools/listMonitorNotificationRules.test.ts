import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listMonitorNotificationRules } from "./listMonitorNotificationRules.js";

describe("listMonitorNotificationRules", () => {
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
      expect(() => listMonitorNotificationRules.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listMonitorNotificationRules: fresh } = await import(
        "./listMonitorNotificationRules.js"
      );
      await expect(fresh.execute({})).rejects.toThrow(
        "listMonitorNotificationRules not initialized",
      );
    });

    it("makes correct API call and returns results", async () => {
      listMonitorNotificationRules.initialize();
      const mockResponse = {
        data: [{ id: "rule-1", type: "notification_rule", attributes: { name: "Page on-call" } }],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listMonitorNotificationRules.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/monitor/notification_rules"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes pagination params when provided", async () => {
      listMonitorNotificationRules.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await listMonitorNotificationRules.execute({ page_size: 25 });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("page%5Bsize%5D=25"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      listMonitorNotificationRules.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listMonitorNotificationRules.execute({})).rejects.toThrow();
    });
  });
});

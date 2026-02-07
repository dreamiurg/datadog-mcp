import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listNetworkDevices } from "./listNetworkDevices.js";

describe("listNetworkDevices", () => {
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
      expect(() => listNetworkDevices.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listNetworkDevices: fresh } = await import("./listNetworkDevices.js");
      await expect(fresh.execute({})).rejects.toThrow("listNetworkDevices not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listNetworkDevices.initialize();
      const mockResponse = {
        data: [
          { id: "dev-1", type: "network_device", attributes: { name: "router-1", status: "up" } },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listNetworkDevices.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/network/devices"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes query params when provided", async () => {
      listNetworkDevices.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await listNetworkDevices.execute({ page_size: 10, filter_tag: "env:prod" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("page%5Bsize%5D=10"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      listNetworkDevices.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listNetworkDevices.execute({})).rejects.toThrow();
    });
  });
});

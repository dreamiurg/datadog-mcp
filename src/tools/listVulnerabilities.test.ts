import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listVulnerabilities } from "./listVulnerabilities.js";

describe("listVulnerabilities", () => {
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
      expect(() => listVulnerabilities.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listVulnerabilities: fresh } = await import("./listVulnerabilities.js");
      await expect(fresh.execute({})).rejects.toThrow("listVulnerabilities not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listVulnerabilities.initialize();
      const mockResponse = {
        data: [
          {
            id: "vuln-1",
            type: "vulnerability",
            attributes: { title: "CVE-2024-1234", severity: "critical" },
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listVulnerabilities.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/security/vulnerabilities/findings"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes filter params when provided", async () => {
      listVulnerabilities.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await listVulnerabilities.execute({ filter_severity: "critical", page_size: 10 });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("filter%5Bseverity%5D=critical"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      listVulnerabilities.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listVulnerabilities.execute({})).rejects.toThrow();
    });
  });
});

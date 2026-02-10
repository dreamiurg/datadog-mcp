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

    it("calls correct API endpoint", async () => {
      listVulnerabilities.initialize();
      const mockResponse = {
        data: [{ id: "vuln-1", type: "vulnerability", attributes: { title: "CVE-2024-1234" } }],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listVulnerabilities.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/security/vulnerabilities"),
        expect.objectContaining({ method: "GET" }),
      );
      // Must NOT contain the old /findings suffix
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).not.toContain("/findings");
      expect(result).toEqual(mockResponse);
    });

    it("includes filter_tool param", async () => {
      listVulnerabilities.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await listVulnerabilities.execute({ filter_tool: "SAST" });
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain("filter%5Btool%5D=SAST");
    });

    it("includes filter_status param", async () => {
      listVulnerabilities.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await listVulnerabilities.execute({ filter_status: "Open" });
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain("filter%5Bstatus%5D=Open");
    });

    it("includes pagination params", async () => {
      listVulnerabilities.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await listVulnerabilities.execute({ page_number: 2, page_token: "abc123" });
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain("page%5Bnumber%5D=2");
      expect(calledUrl).toContain("page%5Btoken%5D=abc123");
    });

    it("includes multiple filters together", async () => {
      listVulnerabilities.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await listVulnerabilities.execute({
        filter_tool: "SAST",
        filter_status: "Open",
        filter_cvss_base_severity: "Critical",
        filter_asset_type: "Repository",
      });
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain("filter%5Btool%5D=SAST");
      expect(calledUrl).toContain("filter%5Bstatus%5D=Open");
      expect(calledUrl).toContain("filter%5Bcvss%5D%5Bbase%5D%5Bseverity%5D=Critical");
      expect(calledUrl).toContain("filter%5Basset%5D%5Btype%5D=Repository");
    });

    it("includes boolean filter params", async () => {
      listVulnerabilities.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await listVulnerabilities.execute({
        filter_fix_available: true,
        filter_asset_risks_in_production: true,
      });
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain("filter%5Bfix_available%5D=true");
      expect(calledUrl).toContain("filter%5Basset%5D%5Brisks%5D%5Bin_production%5D=true");
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

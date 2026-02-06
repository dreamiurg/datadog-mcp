import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listRumApplications } from "./listRumApplications.js";

describe("listRumApplications", () => {
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
      expect(() => listRumApplications.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listRumApplications: fresh } = await import("./listRumApplications.js");
      await expect(fresh.execute({})).rejects.toThrow("listRumApplications not initialized");
    });

    it("fetches RUM applications successfully", async () => {
      listRumApplications.initialize();
      const mockResponse = {
        data: [
          {
            id: "app-1",
            type: "rum_application",
            attributes: {
              name: "Web App",
              org_id: 12345,
              type: "browser",
              created_at: "2024-01-01T00:00:00Z",
              created_by_handle: "user@example.com",
            },
          },
          {
            id: "app-2",
            type: "rum_application",
            attributes: {
              name: "Mobile App",
              org_id: 12345,
              type: "ios",
              created_at: "2024-01-02T00:00:00Z",
              created_by_handle: "user@example.com",
            },
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listRumApplications.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/rum/applications"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles empty response", async () => {
      listRumApplications.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      const result = await listRumApplications.execute({});
      expect(result?.data).toHaveLength(0);
    });
  });
});

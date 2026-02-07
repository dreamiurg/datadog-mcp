import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { searchIncidents } from "./searchIncidents.js";

describe("searchIncidents", () => {
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
      expect(() => searchIncidents.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { searchIncidents: fresh } = await import("./searchIncidents.js");
      await expect(fresh.execute({ query: "test" })).rejects.toThrow(
        "searchIncidents not initialized",
      );
    });

    it("makes correct API call and returns results", async () => {
      searchIncidents.initialize();
      const mockResponse = {
        data: [
          { id: "inc-1", type: "incidents", attributes: { title: "DB outage", severity: "SEV-1" } },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await searchIncidents.execute({ query: "database" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/incidents/search"),
        expect.objectContaining({ method: "POST" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes filter and page params in request body", async () => {
      searchIncidents.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await searchIncidents.execute({
        query: "service:web",
        page_size: 10,
      });
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.query).toBe("service:web");
      expect(body.page.size).toBe(10);
    });

    it("handles API errors", async () => {
      searchIncidents.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(searchIncidents.execute({ query: "test" })).rejects.toThrow();
    });
  });
});

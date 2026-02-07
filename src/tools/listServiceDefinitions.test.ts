import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listServiceDefinitions } from "./listServiceDefinitions.js";

describe("listServiceDefinitions", () => {
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
      expect(() => listServiceDefinitions.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listServiceDefinitions: fresh } = await import("./listServiceDefinitions.js");
      await expect(fresh.execute({})).rejects.toThrow("listServiceDefinitions not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listServiceDefinitions.initialize();

      const mockResponse = {
        data: [
          {
            id: "service-1",
            type: "service_definitions",
            attributes: {
              schema: { version: "v2.2" },
              meta: {},
            },
          },
        ],
        meta: {
          page: { total_count: 1 },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await listServiceDefinitions.execute({});

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.datadoghq.com/api/v2/services/definitions",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "DD-API-KEY": "test-api-key",
            "DD-APPLICATION-KEY": "test-app-key",
          }),
        }),
      );

      expect(result).toEqual(mockResponse);
    });

    it("includes query parameters when provided", async () => {
      listServiceDefinitions.initialize();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      });

      await listServiceDefinitions.execute({
        pageSize: 50,
        pageNumber: 2,
        schemaVersion: "v2.2",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.datadoghq.com/api/v2/services/definitions?page%5Bsize%5D=50&page%5Bnumber%5D=2&schema_version=v2.2",
        expect.any(Object),
      );
    });

    it("handles API errors", async () => {
      listServiceDefinitions.initialize();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        text: async () => "Access denied",
        json: async () => ({ errors: ["Access denied"] }),
      });

      await expect(listServiceDefinitions.execute({})).rejects.toThrow(
        "Failed to list service definitions from Datadog Service Catalog",
      );
    });
  });
});

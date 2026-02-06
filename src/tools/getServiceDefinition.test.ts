import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getServiceDefinition } from "./getServiceDefinition.js";

describe("getServiceDefinition", () => {
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
      expect(() => getServiceDefinition.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getServiceDefinition: fresh } = await import("./getServiceDefinition.js");
      await expect(fresh.execute({ serviceName: "test-service" })).rejects.toThrow(
        "getServiceDefinition not initialized",
      );
    });

    it("makes correct API call and returns results", async () => {
      getServiceDefinition.initialize();

      const mockResponse = {
        data: {
          id: "my-service",
          type: "service_definitions",
          attributes: {
            schema: {
              schema_version: "v2.2",
              dd_service: "my-service",
            },
            meta: {},
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await getServiceDefinition.execute({
        serviceName: "my-service",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://datadoghq.com/api/v2/services/definitions/my-service",
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

    it("URL-encodes service name", async () => {
      getServiceDefinition.initialize();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: {} }),
      });

      await getServiceDefinition.execute({
        serviceName: "my/service@v2",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://datadoghq.com/api/v2/services/definitions/my%2Fservice%40v2",
        expect.any(Object),
      );
    });

    it("includes schema version query parameter when provided", async () => {
      getServiceDefinition.initialize();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: {} }),
      });

      await getServiceDefinition.execute({
        serviceName: "my-service",
        schemaVersion: "v2.1",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://datadoghq.com/api/v2/services/definitions/my-service?schema_version=v2.1",
        expect.any(Object),
      );
    });

    it("handles API errors", async () => {
      getServiceDefinition.initialize();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: async () => "Service not found",
        json: async () => ({ errors: ["Service not found"] }),
      });

      await expect(getServiceDefinition.execute({ serviceName: "nonexistent" })).rejects.toThrow(
        "The requested resource was not found.",
      );
    });
  });
});

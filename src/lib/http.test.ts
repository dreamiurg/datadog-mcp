import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { datadogRequest } from "./http.js";

describe("http", () => {
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

    // Mock global fetch
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
  });

  describe("datadogRequest", () => {
    it("makes POST request by default", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: "test" }),
      });

      await datadogRequest({
        service: "default",
        path: "/api/v1/test",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://datadoghq.com/api/v1/test",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "DD-API-KEY": "test-api-key",
            "DD-APPLICATION-KEY": "test-app-key",
          }),
        }),
      );
    });

    it("makes GET request when specified", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: "test" }),
      });

      await datadogRequest({
        service: "default",
        path: "/api/v1/test",
        method: "GET",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "GET",
        }),
      );
    });

    it("serializes body as JSON", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: "test" }),
      });

      const body = { query: "test query", from: 0 };

      await datadogRequest({
        service: "default",
        path: "/api/v1/test",
        body,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(body),
        }),
      );
    });

    it("does not include body when not provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: "test" }),
      });

      await datadogRequest({
        service: "default",
        path: "/api/v1/test",
        method: "GET",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: undefined,
        }),
      );
    });

    it("uses correct base URL for logs service", async () => {
      process.env.DD_LOGS_SITE = "logs.datadoghq.eu";

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: "test" }),
      });

      await datadogRequest({
        service: "logs",
        path: "/api/v2/logs/events/search",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://logs.datadoghq.eu/api/v2/logs/events/search",
        expect.any(Object),
      );
    });

    it("uses correct base URL for metrics service", async () => {
      process.env.DD_METRICS_SITE = "metrics.datadoghq.eu";

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: "test" }),
      });

      await datadogRequest({
        service: "metrics",
        path: "/api/v2/metrics",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://metrics.datadoghq.eu/api/v2/metrics",
        expect.any(Object),
      );
    });

    it("returns parsed JSON response", async () => {
      const expectedData = { data: [{ id: 1 }, { id: 2 }] };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(expectedData),
      });

      const result = await datadogRequest({
        service: "default",
        path: "/api/v1/test",
      });

      expect(result).toEqual(expectedData);
    });

    it("throws HttpError on non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: () => Promise.resolve("Forbidden"),
      });

      await expect(
        datadogRequest({
          service: "default",
          path: "/api/v1/test",
        }),
      ).rejects.toEqual({
        status: 403,
        message: "Forbidden",
      });
    });

    it("throws HttpError with 404 status", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve("Not Found"),
      });

      await expect(
        datadogRequest({
          service: "default",
          path: "/api/v1/dashboard/invalid",
        }),
      ).rejects.toEqual({
        status: 404,
        message: "Not Found",
      });
    });

    it("throws HttpError with 429 rate limit", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: () => Promise.resolve("Rate Limit Exceeded"),
      });

      await expect(
        datadogRequest({
          service: "default",
          path: "/api/v1/test",
        }),
      ).rejects.toEqual({
        status: 429,
        message: "Rate Limit Exceeded",
      });
    });

    it("throws error when credentials are missing", async () => {
      delete process.env.DD_API_KEY;

      await expect(
        datadogRequest({
          service: "default",
          path: "/api/v1/test",
        }),
      ).rejects.toThrow("Datadog API Key and App Key are required");
    });

    it("supports PUT method", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await datadogRequest({
        service: "default",
        path: "/api/v1/test",
        method: "PUT",
        body: { updated: true },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "PUT",
        }),
      );
    });

    it("supports DELETE method", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ deleted: true }),
      });

      await datadogRequest({
        service: "default",
        path: "/api/v1/test/123",
        method: "DELETE",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });
  });
});

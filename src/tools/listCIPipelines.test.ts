import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listCIPipelines } from "./listCIPipelines.js";

describe("listCIPipelines", () => {
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
      expect(() => listCIPipelines.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listCIPipelines: fresh } = await import("./listCIPipelines.js");
      await expect(fresh.execute({})).rejects.toThrow("listCIPipelines not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listCIPipelines.initialize();

      const mockResponse = {
        data: [
          {
            id: "pipeline-1",
            type: "ci_pipeline_event",
            attributes: {
              pipeline_id: "abc123",
              status: "success",
            },
          },
        ],
        links: {
          next: "https://datadoghq.com/api/v2/ci/pipelines/events?cursor=xyz",
        },
        meta: {
          page: { after: "xyz" },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await listCIPipelines.execute({});

      expect(mockFetch).toHaveBeenCalledWith(
        "https://datadoghq.com/api/v2/ci/pipelines/events",
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

    it("includes all query parameters when provided", async () => {
      listCIPipelines.initialize();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      });

      await listCIPipelines.execute({
        filterQuery: "@ci.pipeline.name:my-pipeline",
        filterFrom: "2024-01-01T00:00:00Z",
        filterTo: "2024-01-31T23:59:59Z",
        pageLimit: 100,
        pageCursor: "abc123",
        sort: "-timestamp",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://datadoghq.com/api/v2/ci/pipelines/events?filter%5Bquery%5D=%40ci.pipeline.name%3Amy-pipeline&filter%5Bfrom%5D=2024-01-01T00%3A00%3A00Z&filter%5Bto%5D=2024-01-31T23%3A59%3A59Z&page%5Blimit%5D=100&page%5Bcursor%5D=abc123&sort=-timestamp",
        expect.any(Object),
      );
    });

    it("handles API errors", async () => {
      listCIPipelines.initialize();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: async () => "Invalid query",
        json: async () => ({ errors: ["Invalid query"] }),
      });

      await expect(listCIPipelines.execute({})).rejects.toThrow(
        "Failed to list CI pipeline events from Datadog",
      );
    });
  });
});

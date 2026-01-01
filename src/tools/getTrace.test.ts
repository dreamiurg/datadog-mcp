import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTrace } from "./getTrace.js";

describe("getTrace", () => {
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
      expect(() => getTrace.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getTrace: freshGetTrace } = await import("./getTrace.js");

      await expect(freshGetTrace.execute({ traceId: "abc123def456789012345678" })).rejects.toThrow(
        "getTrace not initialized",
      );
    });

    it("fetches trace spans by trace ID", async () => {
      getTrace.initialize();

      const mockResponse = {
        data: [
          { id: "span-1", attributes: { resource_name: "/api/users" } },
          { id: "span-2", attributes: { resource_name: "/api/orders" } },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // Valid 64-bit trace ID (16 hex chars)
      const result = await getTrace.execute({
        traceId: "abc123def4567890",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/spans/events/search"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("trace_id:abc123def4567890"),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("accepts 128-bit trace ID (32 hex chars)", async () => {
      getTrace.initialize();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      await expect(
        getTrace.execute({ traceId: "abc123def4567890abc123def4567890" }),
      ).resolves.not.toThrow();
    });

    // Security-critical: traceId validation prevents injection
    it("rejects invalid trace ID format", async () => {
      getTrace.initialize();

      await expect(getTrace.execute({ traceId: "invalid-id!" })).rejects.toThrow(
        "Invalid trace ID format",
      );
    });

    it("rejects trace ID that is too short", async () => {
      getTrace.initialize();

      await expect(getTrace.execute({ traceId: "abc123" })).rejects.toThrow(
        "Invalid trace ID format",
      );
    });

    it("rejects trace ID that is too long", async () => {
      getTrace.initialize();

      await expect(getTrace.execute({ traceId: "a".repeat(33) })).rejects.toThrow(
        "Invalid trace ID format",
      );
    });
  });
});

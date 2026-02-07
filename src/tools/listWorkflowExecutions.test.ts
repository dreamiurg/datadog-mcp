import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listWorkflowExecutions } from "./listWorkflowExecutions.js";

describe("listWorkflowExecutions", () => {
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
      expect(() => listWorkflowExecutions.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listWorkflowExecutions: fresh } = await import("./listWorkflowExecutions.js");
      await expect(fresh.execute({ workflowId: "wf-123" })).rejects.toThrow(
        "listWorkflowExecutions not initialized",
      );
    });

    it("makes correct API call", async () => {
      listWorkflowExecutions.initialize();
      const mockResponse = { data: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });
      const result = await listWorkflowExecutions.execute({
        workflowId: "wf-123",
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain("/api/v2/workflows/wf-123/instances");
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      listWorkflowExecutions.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        text: async () => "Access denied",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listWorkflowExecutions.execute({ workflowId: "wf-123" })).rejects.toThrow();
    });
  });
});

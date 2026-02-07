import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getIncidentTodos } from "./getIncidentTodos.js";

describe("getIncidentTodos", () => {
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
      expect(() => getIncidentTodos.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { getIncidentTodos: fresh } = await import("./getIncidentTodos.js");
      await expect(fresh.execute({ incident_id: "inc-1" })).rejects.toThrow(
        "getIncidentTodos not initialized",
      );
    });

    it("makes correct API call and returns results", async () => {
      getIncidentTodos.initialize();
      const mockResponse = {
        data: [
          {
            id: "todo-1",
            type: "incident_todos",
            attributes: { content: "Restart the service", completed: "false" },
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await getIncidentTodos.execute({ incident_id: "inc-123" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/incidents/inc-123/todos"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      getIncidentTodos.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({ errors: ["Not Found"] }),
      });
      await expect(getIncidentTodos.execute({ incident_id: "bad" })).rejects.toThrow();
    });
  });
});

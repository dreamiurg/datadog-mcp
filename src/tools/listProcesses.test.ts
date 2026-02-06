import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listProcesses } from "./listProcesses.js";

describe("listProcesses", () => {
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
      expect(() => listProcesses.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listProcesses: fresh } = await import("./listProcesses.js");
      await expect(fresh.execute({})).rejects.toThrow("listProcesses not initialized");
    });

    it("lists processes without parameters", async () => {
      listProcesses.initialize();
      const mockResponse = {
        data: [
          { id: "1", type: "process", attributes: { pid: 1234 } },
          { id: "2", type: "process", attributes: { pid: 5678 } },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listProcesses.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/processes"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("lists processes with search parameter", async () => {
      listProcesses.initialize();
      const mockResponse = { data: [{ id: "1", type: "process" }] };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listProcesses.execute({ search: "nginx" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/processes?search=nginx"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("lists processes with tags parameter", async () => {
      listProcesses.initialize();
      const mockResponse = { data: [{ id: "1", type: "process" }] };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listProcesses.execute({ tags: "env:prod,service:web" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/processes?tags=env%3Aprod%2Cservice%3Aweb"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("lists processes with from and to parameters", async () => {
      listProcesses.initialize();
      const mockResponse = { data: [{ id: "1", type: "process" }] };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const from = 1640995200;
      const to = 1641081600;
      const result = await listProcesses.execute({ from, to });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/v2/processes?from=${from}&to=${to}`),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("lists processes with pageLimit parameter", async () => {
      listProcesses.initialize();
      const mockResponse = {
        data: [{ id: "1", type: "process" }],
        meta: { page: { after: "cursor-123", size: 10 } },
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listProcesses.execute({ pageLimit: 10 });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/processes?page%5Blimit%5D=10"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("lists processes with pageCursor parameter", async () => {
      listProcesses.initialize();
      const mockResponse = { data: [{ id: "2", type: "process" }] };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listProcesses.execute({ pageCursor: "cursor-abc" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/processes?page%5Bcursor%5D=cursor-abc"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("lists processes with all parameters", async () => {
      listProcesses.initialize();
      const mockResponse = {
        data: [{ id: "1", type: "process" }],
        meta: { page: { after: "cursor-xyz", size: 20 } },
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listProcesses.execute({
        search: "postgres",
        tags: "env:staging",
        from: 1640995200,
        to: 1641081600,
        pageLimit: 20,
        pageCursor: "cursor-prev",
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(
          /\/api\/v2\/processes\?.*search=postgres.*tags=env%3Astaging.*from=1640995200.*to=1641081600.*page%5Blimit%5D=20.*page%5Bcursor%5D=cursor-prev/,
        ),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });
  });
});

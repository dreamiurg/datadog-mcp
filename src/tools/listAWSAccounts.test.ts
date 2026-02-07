import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listAWSAccounts } from "./listAWSAccounts.js";

describe("listAWSAccounts", () => {
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
      expect(() => listAWSAccounts.initialize()).not.toThrow();
    });
  });

  describe("execute", () => {
    it("throws if not initialized", async () => {
      vi.resetModules();
      const { listAWSAccounts: fresh } = await import("./listAWSAccounts.js");
      await expect(fresh.execute({})).rejects.toThrow("listAWSAccounts not initialized");
    });

    it("makes correct API call and returns results", async () => {
      listAWSAccounts.initialize();
      const mockResponse = {
        data: [
          {
            id: "aws-1",
            type: "aws_account",
            attributes: { aws_account_id: "123456789012", aws_partition: "aws" },
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });
      const result = await listAWSAccounts.execute({});
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/integration/aws/accounts"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes query params when provided", async () => {
      listAWSAccounts.initialize();
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await listAWSAccounts.execute({ aws_account_id: "123456789012" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("aws_account_id=123456789012"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("handles API errors", async () => {
      listAWSAccounts.initialize();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ errors: ["Forbidden"] }),
      });
      await expect(listAWSAccounts.execute({})).rejects.toThrow();
    });
  });
});

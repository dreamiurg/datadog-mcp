import { beforeEach, describe, expect, it, vi } from "vitest";
import { DatadogApiError, handleApiError } from "./errors.js";

describe("errors", () => {
  beforeEach(() => {
    // Suppress console.error during tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("DatadogApiError", () => {
    it("creates error with message only", () => {
      const error = new DatadogApiError("Test error");

      expect(error.message).toBe("Test error");
      expect(error.name).toBe("DatadogApiError");
      expect(error.statusCode).toBeUndefined();
      expect(error.context).toBeUndefined();
    });

    it("creates error with status code", () => {
      const error = new DatadogApiError("Test error", 404);

      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(404);
    });

    it("creates error with context", () => {
      const error = new DatadogApiError("Test error", 500, "fetching dashboards");

      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(500);
      expect(error.context).toBe("fetching dashboards");
    });

    it("is an instance of Error", () => {
      const error = new DatadogApiError("Test error");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DatadogApiError);
    });
  });

  describe("handleApiError", () => {
    it("throws 403 error with authorization message", () => {
      const rawError = { status: 403 };

      expect(() => handleApiError(rawError, "fetching monitors")).toThrow(DatadogApiError);

      try {
        handleApiError(rawError, "fetching monitors");
      } catch (e) {
        const error = e as DatadogApiError;
        expect(error.statusCode).toBe(403);
        expect(error.message).toContain("authorization failed");
        expect(error.context).toBe("fetching monitors");
      }
    });

    it("throws 404 error with not found message", () => {
      const rawError = { status: 404 };

      expect(() => handleApiError(rawError, "getting dashboard")).toThrow(DatadogApiError);

      try {
        handleApiError(rawError, "getting dashboard");
      } catch (e) {
        const error = e as DatadogApiError;
        expect(error.statusCode).toBe(404);
        expect(error.message).toContain("not found");
        expect(error.context).toBe("getting dashboard");
      }
    });

    it("throws 429 error with rate limit message", () => {
      const rawError = { status: 429 };

      expect(() => handleApiError(rawError, "searching logs")).toThrow(DatadogApiError);

      try {
        handleApiError(rawError, "searching logs");
      } catch (e) {
        const error = e as DatadogApiError;
        expect(error.statusCode).toBe(429);
        expect(error.message).toContain("Rate limit");
        expect(error.context).toBe("searching logs");
      }
    });

    it("handles error with code property instead of status", () => {
      const rawError = { code: 403 };

      expect(() => handleApiError(rawError, "test")).toThrow(DatadogApiError);

      try {
        handleApiError(rawError, "test");
      } catch (e) {
        const error = e as DatadogApiError;
        expect(error.statusCode).toBe(403);
      }
    });

    it("handles standard Error instances", () => {
      const standardError = new Error("Network failure");

      expect(() => handleApiError(standardError, "test")).toThrow(DatadogApiError);

      try {
        handleApiError(standardError, "test");
      } catch (e) {
        const error = e as DatadogApiError;
        expect(error.message).toBe("Network failure");
        expect(error.context).toBe("test");
      }
    });

    it("handles unknown error types", () => {
      const unknownError = "Something went wrong";

      expect(() => handleApiError(unknownError, "test operation")).toThrow(DatadogApiError);

      try {
        handleApiError(unknownError, "test operation");
      } catch (e) {
        const error = e as DatadogApiError;
        expect(error.message).toContain("unexpected error");
        expect(error.context).toBe("test operation");
      }
    });

    it("handles null error", () => {
      expect(() => handleApiError(null, "test")).toThrow(DatadogApiError);
    });

    it("handles undefined error", () => {
      expect(() => handleApiError(undefined, "test")).toThrow(DatadogApiError);
    });

    it("prefers status over code when both present", () => {
      const rawError = { status: 404, code: 403 };

      try {
        handleApiError(rawError, "test");
      } catch (e) {
        const error = e as DatadogApiError;
        expect(error.statusCode).toBe(404);
      }
    });

    it("logs error for 500+ status codes", () => {
      const rawError = { status: 500 };

      expect(() => handleApiError(rawError, "server error test")).toThrow(DatadogApiError);

      try {
        handleApiError(rawError, "server error test");
      } catch (e) {
        const error = e as DatadogApiError;
        expect(error.statusCode).toBe(500);
        expect(error.context).toBe("server error test");
      }
    });

    it("logs warning for 400-499 status codes (non-specific)", () => {
      const rawError = { status: 401 };

      expect(() => handleApiError(rawError, "auth error test")).toThrow(DatadogApiError);

      try {
        handleApiError(rawError, "auth error test");
      } catch (e) {
        const error = e as DatadogApiError;
        expect(error.statusCode).toBe(401);
        expect(error.context).toBe("auth error test");
      }
    });

    it("logs error for unknown status codes", () => {
      const rawError = { status: 0 };

      expect(() => handleApiError(rawError, "unknown status test")).toThrow(DatadogApiError);
    });
  });
});

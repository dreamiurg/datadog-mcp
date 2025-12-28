"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const errors_js_1 = require("./errors.js");
(0, vitest_1.describe)("errors", () => {
    (0, vitest_1.beforeEach)(() => {
        // Suppress console.error during tests
        vitest_1.vi.spyOn(console, "error").mockImplementation(() => { });
    });
    (0, vitest_1.describe)("DatadogApiError", () => {
        (0, vitest_1.it)("creates error with message only", () => {
            const error = new errors_js_1.DatadogApiError("Test error");
            (0, vitest_1.expect)(error.message).toBe("Test error");
            (0, vitest_1.expect)(error.name).toBe("DatadogApiError");
            (0, vitest_1.expect)(error.statusCode).toBeUndefined();
            (0, vitest_1.expect)(error.context).toBeUndefined();
        });
        (0, vitest_1.it)("creates error with status code", () => {
            const error = new errors_js_1.DatadogApiError("Test error", 404);
            (0, vitest_1.expect)(error.message).toBe("Test error");
            (0, vitest_1.expect)(error.statusCode).toBe(404);
        });
        (0, vitest_1.it)("creates error with context", () => {
            const error = new errors_js_1.DatadogApiError("Test error", 500, "fetching dashboards");
            (0, vitest_1.expect)(error.message).toBe("Test error");
            (0, vitest_1.expect)(error.statusCode).toBe(500);
            (0, vitest_1.expect)(error.context).toBe("fetching dashboards");
        });
        (0, vitest_1.it)("is an instance of Error", () => {
            const error = new errors_js_1.DatadogApiError("Test error");
            (0, vitest_1.expect)(error).toBeInstanceOf(Error);
            (0, vitest_1.expect)(error).toBeInstanceOf(errors_js_1.DatadogApiError);
        });
    });
    (0, vitest_1.describe)("handleApiError", () => {
        (0, vitest_1.it)("throws 403 error with authorization message", () => {
            const rawError = { status: 403 };
            (0, vitest_1.expect)(() => (0, errors_js_1.handleApiError)(rawError, "fetching monitors")).toThrow(errors_js_1.DatadogApiError);
            try {
                (0, errors_js_1.handleApiError)(rawError, "fetching monitors");
            }
            catch (e) {
                const error = e;
                (0, vitest_1.expect)(error.statusCode).toBe(403);
                (0, vitest_1.expect)(error.message).toContain("authorization failed");
                (0, vitest_1.expect)(error.context).toBe("fetching monitors");
            }
        });
        (0, vitest_1.it)("throws 404 error with not found message", () => {
            const rawError = { status: 404 };
            (0, vitest_1.expect)(() => (0, errors_js_1.handleApiError)(rawError, "getting dashboard")).toThrow(errors_js_1.DatadogApiError);
            try {
                (0, errors_js_1.handleApiError)(rawError, "getting dashboard");
            }
            catch (e) {
                const error = e;
                (0, vitest_1.expect)(error.statusCode).toBe(404);
                (0, vitest_1.expect)(error.message).toContain("not found");
                (0, vitest_1.expect)(error.context).toBe("getting dashboard");
            }
        });
        (0, vitest_1.it)("throws 429 error with rate limit message", () => {
            const rawError = { status: 429 };
            (0, vitest_1.expect)(() => (0, errors_js_1.handleApiError)(rawError, "searching logs")).toThrow(errors_js_1.DatadogApiError);
            try {
                (0, errors_js_1.handleApiError)(rawError, "searching logs");
            }
            catch (e) {
                const error = e;
                (0, vitest_1.expect)(error.statusCode).toBe(429);
                (0, vitest_1.expect)(error.message).toContain("Rate limit");
                (0, vitest_1.expect)(error.context).toBe("searching logs");
            }
        });
        (0, vitest_1.it)("handles error with code property instead of status", () => {
            const rawError = { code: 403 };
            (0, vitest_1.expect)(() => (0, errors_js_1.handleApiError)(rawError, "test")).toThrow(errors_js_1.DatadogApiError);
            try {
                (0, errors_js_1.handleApiError)(rawError, "test");
            }
            catch (e) {
                const error = e;
                (0, vitest_1.expect)(error.statusCode).toBe(403);
            }
        });
        (0, vitest_1.it)("handles standard Error instances", () => {
            const standardError = new Error("Network failure");
            (0, vitest_1.expect)(() => (0, errors_js_1.handleApiError)(standardError, "test")).toThrow(errors_js_1.DatadogApiError);
            try {
                (0, errors_js_1.handleApiError)(standardError, "test");
            }
            catch (e) {
                const error = e;
                (0, vitest_1.expect)(error.message).toBe("Network failure");
                (0, vitest_1.expect)(error.context).toBe("test");
            }
        });
        (0, vitest_1.it)("handles unknown error types", () => {
            const unknownError = "Something went wrong";
            (0, vitest_1.expect)(() => (0, errors_js_1.handleApiError)(unknownError, "test operation")).toThrow(errors_js_1.DatadogApiError);
            try {
                (0, errors_js_1.handleApiError)(unknownError, "test operation");
            }
            catch (e) {
                const error = e;
                (0, vitest_1.expect)(error.message).toContain("unexpected error");
                (0, vitest_1.expect)(error.context).toBe("test operation");
            }
        });
        (0, vitest_1.it)("handles null error", () => {
            (0, vitest_1.expect)(() => (0, errors_js_1.handleApiError)(null, "test")).toThrow(errors_js_1.DatadogApiError);
        });
        (0, vitest_1.it)("handles undefined error", () => {
            (0, vitest_1.expect)(() => (0, errors_js_1.handleApiError)(undefined, "test")).toThrow(errors_js_1.DatadogApiError);
        });
        (0, vitest_1.it)("prefers status over code when both present", () => {
            const rawError = { status: 404, code: 403 };
            try {
                (0, errors_js_1.handleApiError)(rawError, "test");
            }
            catch (e) {
                const error = e;
                (0, vitest_1.expect)(error.statusCode).toBe(404);
            }
        });
    });
});

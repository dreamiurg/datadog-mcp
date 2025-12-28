"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const http_js_1 = require("./http.js");
(0, vitest_1.describe)("http", () => {
    const originalEnv = process.env;
    const mockFetch = vitest_1.vi.fn();
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetModules();
        process.env = {
            ...originalEnv,
            DD_API_KEY: "test-api-key",
            DD_APP_KEY: "test-app-key",
        };
        // Mock global fetch
        vitest_1.vi.stubGlobal("fetch", mockFetch);
        mockFetch.mockReset();
    });
    (0, vitest_1.afterEach)(() => {
        process.env = originalEnv;
        vitest_1.vi.unstubAllGlobals();
    });
    (0, vitest_1.describe)("datadogRequest", () => {
        (0, vitest_1.it)("makes POST request by default", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: "test" }),
            });
            await (0, http_js_1.datadogRequest)({
                service: "default",
                path: "/api/v1/test",
            });
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith("https://datadoghq.com/api/v1/test", vitest_1.expect.objectContaining({
                method: "POST",
                headers: vitest_1.expect.objectContaining({
                    "Content-Type": "application/json",
                    "DD-API-KEY": "test-api-key",
                    "DD-APPLICATION-KEY": "test-app-key",
                }),
            }));
        });
        (0, vitest_1.it)("makes GET request when specified", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: "test" }),
            });
            await (0, http_js_1.datadogRequest)({
                service: "default",
                path: "/api/v1/test",
                method: "GET",
            });
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith(vitest_1.expect.any(String), vitest_1.expect.objectContaining({
                method: "GET",
            }));
        });
        (0, vitest_1.it)("serializes body as JSON", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: "test" }),
            });
            const body = { query: "test query", from: 0 };
            await (0, http_js_1.datadogRequest)({
                service: "default",
                path: "/api/v1/test",
                body,
            });
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith(vitest_1.expect.any(String), vitest_1.expect.objectContaining({
                body: JSON.stringify(body),
            }));
        });
        (0, vitest_1.it)("does not include body when not provided", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: "test" }),
            });
            await (0, http_js_1.datadogRequest)({
                service: "default",
                path: "/api/v1/test",
                method: "GET",
            });
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith(vitest_1.expect.any(String), vitest_1.expect.objectContaining({
                body: undefined,
            }));
        });
        (0, vitest_1.it)("uses correct base URL for logs service", async () => {
            process.env.DD_LOGS_SITE = "logs.datadoghq.eu";
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: "test" }),
            });
            await (0, http_js_1.datadogRequest)({
                service: "logs",
                path: "/api/v2/logs/events/search",
            });
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith("https://logs.datadoghq.eu/api/v2/logs/events/search", vitest_1.expect.any(Object));
        });
        (0, vitest_1.it)("uses correct base URL for metrics service", async () => {
            process.env.DD_METRICS_SITE = "metrics.datadoghq.eu";
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: "test" }),
            });
            await (0, http_js_1.datadogRequest)({
                service: "metrics",
                path: "/api/v2/metrics",
            });
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith("https://metrics.datadoghq.eu/api/v2/metrics", vitest_1.expect.any(Object));
        });
        (0, vitest_1.it)("returns parsed JSON response", async () => {
            const expectedData = { data: [{ id: 1 }, { id: 2 }] };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(expectedData),
            });
            const result = await (0, http_js_1.datadogRequest)({
                service: "default",
                path: "/api/v1/test",
            });
            (0, vitest_1.expect)(result).toEqual(expectedData);
        });
        (0, vitest_1.it)("throws HttpError on non-ok response", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 403,
                text: () => Promise.resolve("Forbidden"),
            });
            await (0, vitest_1.expect)((0, http_js_1.datadogRequest)({
                service: "default",
                path: "/api/v1/test",
            })).rejects.toEqual({
                status: 403,
                message: "Forbidden",
            });
        });
        (0, vitest_1.it)("throws HttpError with 404 status", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                text: () => Promise.resolve("Not Found"),
            });
            await (0, vitest_1.expect)((0, http_js_1.datadogRequest)({
                service: "default",
                path: "/api/v1/dashboard/invalid",
            })).rejects.toEqual({
                status: 404,
                message: "Not Found",
            });
        });
        (0, vitest_1.it)("throws HttpError with 429 rate limit", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 429,
                text: () => Promise.resolve("Rate Limit Exceeded"),
            });
            await (0, vitest_1.expect)((0, http_js_1.datadogRequest)({
                service: "default",
                path: "/api/v1/test",
            })).rejects.toEqual({
                status: 429,
                message: "Rate Limit Exceeded",
            });
        });
        (0, vitest_1.it)("throws error when credentials are missing", async () => {
            delete process.env.DD_API_KEY;
            await (0, vitest_1.expect)((0, http_js_1.datadogRequest)({
                service: "default",
                path: "/api/v1/test",
            })).rejects.toThrow("Datadog API Key and App Key are required");
        });
        (0, vitest_1.it)("supports PUT method", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ success: true }),
            });
            await (0, http_js_1.datadogRequest)({
                service: "default",
                path: "/api/v1/test",
                method: "PUT",
                body: { updated: true },
            });
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith(vitest_1.expect.any(String), vitest_1.expect.objectContaining({
                method: "PUT",
            }));
        });
        (0, vitest_1.it)("supports DELETE method", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ deleted: true }),
            });
            await (0, http_js_1.datadogRequest)({
                service: "default",
                path: "/api/v1/test/123",
                method: "DELETE",
            });
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith(vitest_1.expect.any(String), vitest_1.expect.objectContaining({
                method: "DELETE",
            }));
        });
    });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const config_js_1 = require("./config.js");
(0, vitest_1.describe)("config", () => {
    const originalEnv = process.env;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetModules();
        process.env = { ...originalEnv };
    });
    (0, vitest_1.afterEach)(() => {
        process.env = originalEnv;
    });
    (0, vitest_1.describe)("getCredentials", () => {
        (0, vitest_1.it)("returns credentials when both API and App keys are set", () => {
            process.env.DD_API_KEY = "test-api-key";
            process.env.DD_APP_KEY = "test-app-key";
            const creds = (0, config_js_1.getCredentials)();
            (0, vitest_1.expect)(creds).toEqual({
                apiKey: "test-api-key",
                appKey: "test-app-key",
            });
        });
        (0, vitest_1.it)("throws error when API key is missing", () => {
            process.env.DD_APP_KEY = "test-app-key";
            delete process.env.DD_API_KEY;
            (0, vitest_1.expect)(() => (0, config_js_1.getCredentials)()).toThrow("Datadog API Key and App Key are required");
        });
        (0, vitest_1.it)("throws error when App key is missing", () => {
            process.env.DD_API_KEY = "test-api-key";
            delete process.env.DD_APP_KEY;
            (0, vitest_1.expect)(() => (0, config_js_1.getCredentials)()).toThrow("Datadog API Key and App Key are required");
        });
        (0, vitest_1.it)("throws error when both keys are missing", () => {
            delete process.env.DD_API_KEY;
            delete process.env.DD_APP_KEY;
            (0, vitest_1.expect)(() => (0, config_js_1.getCredentials)()).toThrow("Datadog API Key and App Key are required");
        });
    });
    (0, vitest_1.describe)("getServiceBaseUrl", () => {
        (0, vitest_1.it)("returns default site URL when no env var is set", () => {
            delete process.env.DD_SITE;
            delete process.env.DD_LOGS_SITE;
            delete process.env.DD_METRICS_SITE;
            (0, vitest_1.expect)((0, config_js_1.getServiceBaseUrl)("default")).toBe("https://datadoghq.com");
        });
        (0, vitest_1.it)("uses DD_SITE for default service", () => {
            process.env.DD_SITE = "datadoghq.eu";
            (0, vitest_1.expect)((0, config_js_1.getServiceBaseUrl)("default")).toBe("https://datadoghq.eu");
        });
        (0, vitest_1.it)("uses DD_LOGS_SITE for logs service", () => {
            process.env.DD_LOGS_SITE = "logs.datadoghq.eu";
            (0, vitest_1.expect)((0, config_js_1.getServiceBaseUrl)("logs")).toBe("https://logs.datadoghq.eu");
        });
        (0, vitest_1.it)("uses DD_METRICS_SITE for metrics service", () => {
            process.env.DD_METRICS_SITE = "metrics.datadoghq.eu";
            (0, vitest_1.expect)((0, config_js_1.getServiceBaseUrl)("metrics")).toBe("https://metrics.datadoghq.eu");
        });
        (0, vitest_1.it)("falls back to default site when service-specific env is not set", () => {
            delete process.env.DD_LOGS_SITE;
            delete process.env.DD_METRICS_SITE;
            (0, vitest_1.expect)((0, config_js_1.getServiceBaseUrl)("logs")).toBe("https://datadoghq.com");
            (0, vitest_1.expect)((0, config_js_1.getServiceBaseUrl)("metrics")).toBe("https://datadoghq.com");
        });
    });
    (0, vitest_1.describe)("createDatadogConfiguration", () => {
        (0, vitest_1.beforeEach)(() => {
            process.env.DD_API_KEY = "test-api-key";
            process.env.DD_APP_KEY = "test-app-key";
        });
        (0, vitest_1.it)("creates configuration with default options", () => {
            const config = (0, config_js_1.createDatadogConfiguration)();
            (0, vitest_1.expect)(config).toBeDefined();
            (0, vitest_1.expect)(config.authMethods).toBeDefined();
        });
        (0, vitest_1.it)("creates configuration with custom site", () => {
            process.env.DD_SITE = "datadoghq.eu";
            const config = (0, config_js_1.createDatadogConfiguration)();
            (0, vitest_1.expect)(config).toBeDefined();
        });
        (0, vitest_1.it)("creates configuration for logs service", () => {
            process.env.DD_LOGS_SITE = "logs.datadoghq.eu";
            const config = (0, config_js_1.createDatadogConfiguration)({ service: "logs" });
            (0, vitest_1.expect)(config).toBeDefined();
        });
        (0, vitest_1.it)("enables unstable operations", () => {
            const config = (0, config_js_1.createDatadogConfiguration)({
                unstableOperations: ["v2.listIncidents"],
            });
            (0, vitest_1.expect)(config.unstableOperations["v2.listIncidents"]).toBe(true);
        });
        (0, vitest_1.it)("enables multiple unstable operations", () => {
            const config = (0, config_js_1.createDatadogConfiguration)({
                unstableOperations: ["v2.listIncidents", "v2.createIncident"],
            });
            (0, vitest_1.expect)(config.unstableOperations["v2.listIncidents"]).toBe(true);
            (0, vitest_1.expect)(config.unstableOperations["v2.createIncident"]).toBe(true);
        });
    });
});

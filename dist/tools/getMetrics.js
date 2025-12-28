"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetrics = void 0;
const datadog_api_client_1 = require("@datadog/datadog-api-client");
const index_js_1 = require("../lib/index.js");
const log = (0, index_js_1.createToolLogger)("get-metrics");
let apiInstance = null;
exports.getMetrics = {
    initialize: () => {
        log.debug("initialize() called");
        const configuration = (0, index_js_1.createDatadogConfiguration)({ service: "metrics" });
        apiInstance = new datadog_api_client_1.v1.MetricsApi(configuration);
    },
    execute: async (params) => {
        if (!apiInstance) {
            throw new Error("getMetrics not initialized. Call initialize() first.");
        }
        log.debug({ query: params.q ?? "*" }, "executing get-metrics");
        try {
            const { q } = params;
            const response = await apiInstance.listMetrics({ q: q ?? "*" });
            const resultCount = Array.isArray(response) ? response.length : 1;
            log.info({ resultCount }, "get-metrics completed");
            return response;
        }
        catch (error) {
            log.error({ error }, "get-metrics failed");
            (0, index_js_1.handleApiError)(error, "fetching metrics");
        }
    },
};

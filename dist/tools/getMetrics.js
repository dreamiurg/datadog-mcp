"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetrics = void 0;
const datadog_api_client_1 = require("@datadog/datadog-api-client");
const index_js_1 = require("../lib/index.js");
let apiInstance = null;
exports.getMetrics = {
    initialize: () => {
        const configuration = (0, index_js_1.createDatadogConfiguration)({ service: "metrics" });
        apiInstance = new datadog_api_client_1.v1.MetricsApi(configuration);
    },
    execute: async (params) => {
        if (!apiInstance) {
            throw new Error("getMetrics not initialized. Call initialize() first.");
        }
        try {
            const { q } = params;
            const response = await apiInstance.listMetrics({ q: q ?? "*" });
            return response;
        }
        catch (error) {
            (0, index_js_1.handleApiError)(error, "fetching metrics");
        }
    },
};

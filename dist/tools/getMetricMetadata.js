"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetricMetadata = void 0;
const datadog_api_client_1 = require("@datadog/datadog-api-client");
const index_js_1 = require("../lib/index.js");
let apiInstance = null;
exports.getMetricMetadata = {
    initialize: () => {
        const configuration = (0, index_js_1.createDatadogConfiguration)({ service: "metrics" });
        apiInstance = new datadog_api_client_1.v1.MetricsApi(configuration);
    },
    execute: async (params) => {
        if (!apiInstance) {
            throw new Error("getMetricMetadata not initialized. Call initialize() first.");
        }
        try {
            const { metricName } = params;
            const response = await apiInstance.getMetricMetadata({ metricName });
            return response;
        }
        catch (error) {
            (0, index_js_1.handleApiError)(error, `fetching metadata for metric ${params.metricName}`);
        }
    },
};

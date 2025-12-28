"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonitor = void 0;
const datadog_api_client_1 = require("@datadog/datadog-api-client");
const index_js_1 = require("../lib/index.js");
let apiInstance = null;
exports.getMonitor = {
    initialize: () => {
        const configuration = (0, index_js_1.createDatadogConfiguration)({ service: "metrics" });
        apiInstance = new datadog_api_client_1.v1.MonitorsApi(configuration);
    },
    execute: async (params) => {
        if (!apiInstance) {
            throw new Error("getMonitor not initialized. Call initialize() first.");
        }
        try {
            const { monitorId } = params;
            const response = await apiInstance.getMonitor({ monitorId });
            return response;
        }
        catch (error) {
            (0, index_js_1.handleApiError)(error, `fetching monitor ${params.monitorId}`);
        }
    },
};

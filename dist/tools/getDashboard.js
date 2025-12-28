"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = void 0;
const datadog_api_client_1 = require("@datadog/datadog-api-client");
const index_js_1 = require("../lib/index.js");
let apiInstance = null;
exports.getDashboard = {
    initialize: () => {
        const configuration = (0, index_js_1.createDatadogConfiguration)({ service: "default" });
        apiInstance = new datadog_api_client_1.v1.DashboardsApi(configuration);
    },
    execute: async (params) => {
        if (!apiInstance) {
            throw new Error("getDashboard not initialized. Call initialize() first.");
        }
        try {
            const { dashboardId } = params;
            const response = await apiInstance.getDashboard({ dashboardId });
            return response;
        }
        catch (error) {
            (0, index_js_1.handleApiError)(error, `fetching dashboard ${params.dashboardId}`);
        }
    },
};

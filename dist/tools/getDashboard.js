"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = void 0;
const datadog_api_client_1 = require("@datadog/datadog-api-client");
const index_js_1 = require("../lib/index.js");
const log = (0, index_js_1.createToolLogger)("get-dashboard");
let apiInstance = null;
exports.getDashboard = {
    initialize: () => {
        log.debug("initialize() called");
        const configuration = (0, index_js_1.createDatadogConfiguration)({ service: "default" });
        apiInstance = new datadog_api_client_1.v1.DashboardsApi(configuration);
    },
    execute: async (params) => {
        if (!apiInstance) {
            throw new Error("getDashboard not initialized. Call initialize() first.");
        }
        log.debug({ dashboardId: params.dashboardId }, "executing get-dashboard");
        try {
            const { dashboardId } = params;
            const response = await apiInstance.getDashboard({ dashboardId });
            log.info({ dashboardId }, "get-dashboard completed");
            return response;
        }
        catch (error) {
            log.error({ dashboardId: params.dashboardId, error }, "get-dashboard failed");
            (0, index_js_1.handleApiError)(error, `fetching dashboard ${params.dashboardId}`);
        }
    },
};

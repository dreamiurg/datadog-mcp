"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboards = void 0;
const datadog_api_client_1 = require("@datadog/datadog-api-client");
const index_js_1 = require("../lib/index.js");
const log = (0, index_js_1.createToolLogger)("get-dashboards");
let apiInstance = null;
exports.getDashboards = {
    initialize: () => {
        log.debug("initialize() called");
        const configuration = (0, index_js_1.createDatadogConfiguration)({ service: "default" });
        apiInstance = new datadog_api_client_1.v1.DashboardsApi(configuration);
    },
    execute: async (params) => {
        if (!apiInstance) {
            throw new Error("getDashboards not initialized. Call initialize() first.");
        }
        log.debug({ limit: params.limit }, "executing get-dashboards");
        try {
            const { limit } = params;
            // Note: filterConfigured is accepted for API compatibility but not used
            // as the Datadog API doesn't support server-side filtering
            const response = await apiInstance.listDashboards();
            let filteredDashboards = response.dashboards ?? [];
            if (limit && filteredDashboards.length > limit) {
                filteredDashboards = filteredDashboards.slice(0, limit);
            }
            const resultCount = filteredDashboards.length;
            log.info({ resultCount }, "get-dashboards completed");
            return {
                ...response,
                dashboards: filteredDashboards,
            };
        }
        catch (error) {
            log.error({ error }, "get-dashboards failed");
            (0, index_js_1.handleApiError)(error, "fetching dashboards");
        }
    },
};

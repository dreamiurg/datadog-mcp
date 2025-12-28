"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonitors = void 0;
const datadog_api_client_1 = require("@datadog/datadog-api-client");
const index_js_1 = require("../lib/index.js");
let apiInstance = null;
exports.getMonitors = {
    initialize: () => {
        const configuration = (0, index_js_1.createDatadogConfiguration)({ service: "metrics" });
        apiInstance = new datadog_api_client_1.v1.MonitorsApi(configuration);
    },
    execute: async (params) => {
        if (!apiInstance) {
            throw new Error("getMonitors not initialized. Call initialize() first.");
        }
        try {
            const { groupStates, tags, monitorTags, limit } = params;
            const apiParams = {
                groupStates: groupStates?.join(","),
                tags,
                monitorTags,
            };
            const response = await apiInstance.listMonitors(apiParams);
            if (limit && response.length > limit) {
                return response.slice(0, limit);
            }
            return response;
        }
        catch (error) {
            (0, index_js_1.handleApiError)(error, "fetching monitors");
        }
    },
};

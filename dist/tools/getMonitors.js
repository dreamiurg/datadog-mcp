"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonitors = void 0;
const datadog_api_client_1 = require("@datadog/datadog-api-client");
const index_js_1 = require("../lib/index.js");
const log = (0, index_js_1.createToolLogger)("get-monitors");
let apiInstance = null;
exports.getMonitors = {
    initialize: () => {
        log.debug("initialize() called");
        const configuration = (0, index_js_1.createDatadogConfiguration)({ service: "default" });
        apiInstance = new datadog_api_client_1.v1.MonitorsApi(configuration);
    },
    execute: async (params) => {
        if (!apiInstance) {
            throw new Error("getMonitors not initialized. Call initialize() first.");
        }
        log.debug({
            filters: {
                groupStates: params.groupStates,
                tags: params.tags,
                monitorTags: params.monitorTags,
                limit: params.limit,
            },
        }, "executing get-monitors");
        try {
            const { groupStates, tags, monitorTags, limit } = params;
            const apiParams = {
                groupStates: groupStates?.join(","),
                tags,
                monitorTags,
            };
            const response = await apiInstance.listMonitors(apiParams);
            if (limit && response.length > limit) {
                const result = response.slice(0, limit);
                log.info({ resultCount: result.length }, "get-monitors completed");
                return result;
            }
            log.info({ resultCount: response.length }, "get-monitors completed");
            return response;
        }
        catch (error) {
            log.error({ error }, "get-monitors failed");
            (0, index_js_1.handleApiError)(error, "fetching monitors");
        }
    },
};

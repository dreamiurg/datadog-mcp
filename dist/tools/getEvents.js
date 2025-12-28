"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEvents = void 0;
const datadog_api_client_1 = require("@datadog/datadog-api-client");
const index_js_1 = require("../lib/index.js");
let apiInstance = null;
exports.getEvents = {
    initialize: () => {
        const configuration = (0, index_js_1.createDatadogConfiguration)({ service: "default" });
        apiInstance = new datadog_api_client_1.v1.EventsApi(configuration);
    },
    execute: async (params) => {
        if (!apiInstance) {
            throw new Error("getEvents not initialized. Call initialize() first.");
        }
        try {
            const { start, end, priority, sources, tags, unaggregated, excludeAggregation, limit } = params;
            const apiParams = {
                start,
                end,
                priority,
                sources,
                tags,
                unaggregated,
                excludeAggregate: excludeAggregation,
            };
            const response = await apiInstance.listEvents(apiParams);
            if (limit && response.events && response.events.length > limit) {
                response.events = response.events.slice(0, limit);
            }
            return response;
        }
        catch (error) {
            (0, index_js_1.handleApiError)(error, "fetching events");
        }
    },
};

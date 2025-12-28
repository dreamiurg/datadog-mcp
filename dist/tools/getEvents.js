"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEvents = void 0;
const datadog_api_client_1 = require("@datadog/datadog-api-client");
const index_js_1 = require("../lib/index.js");
const log = (0, index_js_1.createToolLogger)("get-events");
let apiInstance = null;
exports.getEvents = {
    initialize: () => {
        log.debug("initialize() called");
        const configuration = (0, index_js_1.createDatadogConfiguration)({ service: "default" });
        apiInstance = new datadog_api_client_1.v1.EventsApi(configuration);
    },
    execute: async (params) => {
        if (!apiInstance) {
            throw new Error("getEvents not initialized. Call initialize() first.");
        }
        try {
            const { start, end, priority, sources, tags, unaggregated, excludeAggregation, limit } = params;
            log.debug({ start, end, priority }, "execute() called");
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
            log.info({ eventCount: response.events?.length || 0 }, "get-events completed");
            return response;
        }
        catch (error) {
            log.error({ start: params.start, end: params.end, error }, "get-events failed");
            (0, index_js_1.handleApiError)(error, "fetching events");
        }
    },
};

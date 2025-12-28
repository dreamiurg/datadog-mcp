"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateLogs = void 0;
const index_js_1 = require("../lib/index.js");
const log = (0, index_js_1.createToolLogger)("aggregate-logs");
// We still need to call initialize() for API compatibility,
// but the configuration is created per-request for the HTTP client
let initialized = false;
exports.aggregateLogs = {
    initialize: () => {
        log.debug("initialize() called");
        // Validate that configuration can be created (this checks env vars)
        (0, index_js_1.createDatadogConfiguration)({
            service: "logs",
            unstableOperations: ["v2.aggregateLogs"],
        });
        initialized = true;
    },
    execute: async (params) => {
        if (!initialized) {
            throw new Error("aggregateLogs not initialized. Call initialize() first.");
        }
        try {
            const { filter, compute, groupBy, options } = params;
            log.debug({ query: filter?.query, from: filter?.from, to: filter?.to, computeCount: compute?.length || 0, groupByCount: groupBy?.length || 0 }, "execute() called");
            const body = {
                filter,
                compute,
                group_by: groupBy,
                options,
            };
            const data = await (0, index_js_1.datadogRequest)({
                service: "logs",
                path: "/api/v2/logs/analytics/aggregate",
                method: "POST",
                body,
            });
            log.info({ bucketCount: data.data?.buckets?.length || 0 }, "aggregate-logs completed");
            return data;
        }
        catch (error) {
            log.error({ query: params.filter?.query, error }, "aggregate-logs failed");
            (0, index_js_1.handleApiError)(error, "aggregating logs");
        }
    },
};

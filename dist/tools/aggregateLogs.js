"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateLogs = void 0;
const index_js_1 = require("../lib/index.js");
// We still need to call initialize() for API compatibility,
// but the configuration is created per-request for the HTTP client
let initialized = false;
exports.aggregateLogs = {
    initialize: () => {
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
            return data;
        }
        catch (error) {
            (0, index_js_1.handleApiError)(error, "aggregating logs");
        }
    },
};

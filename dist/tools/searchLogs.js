"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchLogs = void 0;
const index_js_1 = require("../lib/index.js");
const log = (0, index_js_1.createToolLogger)("search-logs");
// We still need to call initialize() for API compatibility,
// but the configuration is created per-request for the HTTP client
let initialized = false;
exports.searchLogs = {
    initialize: () => {
        log.debug("initialize() called");
        // Validate that configuration can be created (this checks env vars)
        (0, index_js_1.createDatadogConfiguration)({
            service: "logs",
            unstableOperations: ["v2.listLogsGet"],
        });
        initialized = true;
    },
    execute: async (params) => {
        if (!initialized) {
            throw new Error("searchLogs not initialized. Call initialize() first.");
        }
        try {
            const { filter, sort, page, limit } = params;
            log.debug({ query: filter?.query, from: filter?.from, to: filter?.to }, "execute() called");
            const body = { filter, sort, page };
            const data = await (0, index_js_1.datadogRequest)({
                service: "logs",
                path: "/api/v2/logs/events/search",
                method: "POST",
                body,
            });
            if (limit && data.data && data.data.length > limit) {
                data.data = data.data.slice(0, limit);
            }
            log.info({ resultCount: data.data?.length || 0 }, "search-logs completed");
            return data;
        }
        catch (error) {
            log.error({ query: params.filter?.query, error }, "search-logs failed");
            (0, index_js_1.handleApiError)(error, "searching logs");
        }
    },
};

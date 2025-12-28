"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchLogs = void 0;
const index_js_1 = require("../lib/index.js");
// We still need to call initialize() for API compatibility,
// but the configuration is created per-request for the HTTP client
let initialized = false;
exports.searchLogs = {
    initialize: () => {
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
            return data;
        }
        catch (error) {
            (0, index_js_1.handleApiError)(error, "searching logs");
        }
    },
};

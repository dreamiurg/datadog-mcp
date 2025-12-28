"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonitor = void 0;
const datadog_api_client_1 = require("@datadog/datadog-api-client");
const index_js_1 = require("../lib/index.js");
const log = (0, index_js_1.createToolLogger)("get-monitor");
let apiInstance = null;
exports.getMonitor = {
    initialize: () => {
        log.debug("initialize() called");
        const configuration = (0, index_js_1.createDatadogConfiguration)({ service: "default" });
        apiInstance = new datadog_api_client_1.v1.MonitorsApi(configuration);
    },
    execute: async (params) => {
        if (!apiInstance) {
            throw new Error("getMonitor not initialized. Call initialize() first.");
        }
        log.debug({ monitorId: params.monitorId }, "executing get-monitor");
        try {
            const { monitorId } = params;
            const response = await apiInstance.getMonitor({ monitorId });
            log.info({ monitorId }, "get-monitor completed");
            return response;
        }
        catch (error) {
            log.error({ monitorId: params.monitorId, error }, "get-monitor failed");
            (0, index_js_1.handleApiError)(error, `fetching monitor ${params.monitorId}`);
        }
    },
};

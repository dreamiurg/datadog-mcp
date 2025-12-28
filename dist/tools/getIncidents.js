"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIncidents = void 0;
const datadog_api_client_1 = require("@datadog/datadog-api-client");
const index_js_1 = require("../lib/index.js");
let apiInstance = null;
exports.getIncidents = {
    initialize: () => {
        const configuration = (0, index_js_1.createDatadogConfiguration)({
            service: "default",
            unstableOperations: ["v2.listIncidents", "v2.searchIncidents"],
        });
        apiInstance = new datadog_api_client_1.v2.IncidentsApi(configuration);
    },
    execute: async (params) => {
        if (!apiInstance) {
            throw new Error("getIncidents not initialized. Call initialize() first.");
        }
        try {
            const { includeArchived, pageSize, pageOffset, query, limit } = params;
            // If a query is provided, use searchIncidents instead of listIncidents
            if (query) {
                const searchParams = {
                    query,
                    pageSize,
                    pageOffset,
                };
                const response = await apiInstance.searchIncidents(searchParams);
                const incidents = response.data?.attributes?.incidents;
                if (limit && incidents && incidents.length > limit && response.data?.attributes) {
                    response.data.attributes.incidents = incidents.slice(0, limit);
                }
                return response;
            }
            // Use listIncidents for non-query requests
            const apiParams = {
                pageSize,
                pageOffset,
            };
            // Note: includeArchived doesn't map directly to the API's include parameter
            // The include parameter takes IncidentRelatedObject values like "users", "attachments"
            // The original code was incorrect here - we'll skip includeArchived for now
            // as there's no direct API support for it in listIncidents
            void includeArchived; // Acknowledge but don't use (API doesn't support this filter)
            const response = await apiInstance.listIncidents(apiParams);
            if (limit && response.data && response.data.length > limit) {
                response.data = response.data.slice(0, limit);
            }
            return response;
        }
        catch (error) {
            (0, index_js_1.handleApiError)(error, "fetching incidents");
        }
    },
};

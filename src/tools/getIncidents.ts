import { v2 } from "@datadog/datadog-api-client";
import { createDatadogConfiguration, createToolLogger, handleApiError } from "../lib/index.js";

const log = createToolLogger("get-incidents");

interface GetIncidentsParams {
  includeArchived?: boolean;
  pageSize?: number;
  pageOffset?: number;
  query?: string;
  limit?: number;
}

let apiInstance: v2.IncidentsApi | null = null;

export const getIncidents = {
  initialize: () => {
    log.debug("initialize() called");
    const configuration = createDatadogConfiguration({
      service: "default",
      unstableOperations: ["v2.listIncidents", "v2.searchIncidents"],
    });
    apiInstance = new v2.IncidentsApi(configuration);
  },

  execute: async (params: GetIncidentsParams) => {
    if (!apiInstance) {
      throw new Error("getIncidents not initialized. Call initialize() first.");
    }

    try {
      const { includeArchived, pageSize, pageOffset, query, limit } = params;

      log.debug({ hasQuery: !!query, pageSize, pageOffset }, "execute() called");
      // If a query is provided, use searchIncidents instead of listIncidents
      if (query) {
        const searchParams: v2.IncidentsApiSearchIncidentsRequest = {
          query,
          pageSize,
          pageOffset,
        };

        const response = await apiInstance.searchIncidents(searchParams);

        const incidents = response.data?.attributes?.incidents;
        if (limit && incidents && incidents.length > limit && response.data?.attributes) {
          response.data.attributes.incidents = incidents.slice(0, limit);
        }

        log.info({ incidentCount: incidents?.length || 0 }, "get-incidents (search) completed");
        return response;
      }

      // Use listIncidents for non-query requests
      const apiParams: v2.IncidentsApiListIncidentsRequest = {
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

      log.info({ incidentCount: response.data?.length || 0 }, "get-incidents (list) completed");
      return response;
    } catch (error: unknown) {
      log.error({ hasQuery: !!params.query, error }, "get-incidents failed");
      handleApiError(error, "fetching incidents");
    }
  },
};

import { v1 } from "@datadog/datadog-api-client";
import { createDatadogConfiguration, createToolLogger, handleApiError } from "../lib/index.js";

interface GetSLOsParams {
  ids?: string;
  query?: string;
  tagsQuery?: string;
  metricsQuery?: string;
  limit?: number;
  offset?: number;
}

const log = createToolLogger("get-slos");

let apiInstance: v1.ServiceLevelObjectivesApi | null = null;

export const getSLOs = {
  initialize: () => {
    log.debug("initialize() called");
    const configuration = createDatadogConfiguration({ service: "default" });
    apiInstance = new v1.ServiceLevelObjectivesApi(configuration);
  },

  execute: async (params: GetSLOsParams) => {
    if (!apiInstance) {
      throw new Error("getSLOs not initialized. Call initialize() first.");
    }

    log.debug(
      {
        query: params.query,
        tagsQuery: params.tagsQuery,
        limit: params.limit,
      },
      "executing get-slos",
    );

    try {
      const apiParams: v1.ServiceLevelObjectivesApiListSLOsRequest = {
        ids: params.ids,
        query: params.query,
        tagsQuery: params.tagsQuery,
        metricsQuery: params.metricsQuery,
        limit: params.limit,
        offset: params.offset,
      };

      const response = await apiInstance.listSLOs(apiParams);

      log.info({ sloCount: response.data?.length || 0 }, "get-slos completed");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-slos failed");
      handleApiError(error, "fetching SLOs");
    }
  },
};

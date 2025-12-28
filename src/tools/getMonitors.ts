import { v1 } from "@datadog/datadog-api-client";
import { createDatadogConfiguration, createToolLogger, handleApiError } from "../lib/index.js";

interface GetMonitorsParams {
  groupStates?: string[];
  tags?: string;
  monitorTags?: string;
  limit?: number;
}

const log = createToolLogger("get-monitors");

let apiInstance: v1.MonitorsApi | null = null;

export const getMonitors = {
  initialize: () => {
    log.debug("initialize() called");
    const configuration = createDatadogConfiguration({ service: "default" });
    apiInstance = new v1.MonitorsApi(configuration);
  },

  execute: async (params: GetMonitorsParams) => {
    if (!apiInstance) {
      throw new Error("getMonitors not initialized. Call initialize() first.");
    }

    log.debug(
      {
        filters: {
          groupStates: params.groupStates,
          tags: params.tags,
          monitorTags: params.monitorTags,
          limit: params.limit,
        },
      },
      "executing get-monitors",
    );

    try {
      const { groupStates, tags, monitorTags, limit } = params;

      const apiParams: v1.MonitorsApiListMonitorsRequest = {
        groupStates: groupStates?.join(","),
        tags,
        monitorTags,
      };

      const response = await apiInstance.listMonitors(apiParams);

      if (limit && response.length > limit) {
        const result = response.slice(0, limit);
        log.info({ resultCount: result.length }, "get-monitors completed");
        return result;
      }

      log.info({ resultCount: response.length }, "get-monitors completed");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-monitors failed");
      handleApiError(error, "fetching monitors");
    }
  },
};

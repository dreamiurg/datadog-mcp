import { v2 } from "@datadog/datadog-api-client";
import { createDatadogConfiguration, createToolLogger, handleApiError } from "../lib/index.js";

interface GetDowntimesParams {
  currentOnly?: boolean;
  include?: string;
  pageOffset?: number;
  pageLimit?: number;
}

const log = createToolLogger("get-downtimes");

let apiInstance: v2.DowntimesApi | null = null;

export const getDowntimes = {
  initialize: () => {
    log.debug("initialize() called");
    const configuration = createDatadogConfiguration({ service: "default" });
    apiInstance = new v2.DowntimesApi(configuration);
  },

  execute: async (params: GetDowntimesParams) => {
    if (!apiInstance) {
      throw new Error("getDowntimes not initialized. Call initialize() first.");
    }

    log.debug(
      {
        currentOnly: params.currentOnly,
        pageLimit: params.pageLimit,
      },
      "executing get-downtimes",
    );

    try {
      const apiParams: v2.DowntimesApiListDowntimesRequest = {
        currentOnly: params.currentOnly,
        include: params.include,
        pageOffset: params.pageOffset,
        pageLimit: params.pageLimit,
      };

      const response = await apiInstance.listDowntimes(apiParams);

      log.info({ downtimeCount: response.data?.length || 0 }, "get-downtimes completed");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-downtimes failed");
      handleApiError(error, "fetching downtimes");
    }
  },
};

import { v1 } from "@datadog/datadog-api-client";
import { createDatadogConfiguration, createToolLogger, handleApiError } from "../lib/index.js";

interface GetHostsParams {
  filter?: string;
  sortField?: string;
  sortDir?: string;
  start?: number;
  count?: number;
  from?: number;
  includeMutedHostsData?: boolean;
  includeHostsMetadata?: boolean;
}

const log = createToolLogger("get-hosts");

let apiInstance: v1.HostsApi | null = null;

export const getHosts = {
  initialize: () => {
    log.debug("initialize() called");
    const configuration = createDatadogConfiguration({ service: "default" });
    apiInstance = new v1.HostsApi(configuration);
  },

  execute: async (params: GetHostsParams) => {
    if (!apiInstance) {
      throw new Error("getHosts not initialized. Call initialize() first.");
    }

    log.debug(
      {
        filter: params.filter,
        sortField: params.sortField,
        count: params.count,
      },
      "executing get-hosts",
    );

    try {
      const apiParams: v1.HostsApiListHostsRequest = {
        filter: params.filter,
        sortField: params.sortField,
        sortDir: params.sortDir,
        start: params.start,
        count: params.count,
        from: params.from,
        includeMutedHostsData: params.includeMutedHostsData,
        includeHostsMetadata: params.includeHostsMetadata,
      };

      const response = await apiInstance.listHosts(apiParams);

      log.info({ hostCount: response.hostList?.length || 0 }, "get-hosts completed");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-hosts failed");
      handleApiError(error, "fetching hosts");
    }
  },
};

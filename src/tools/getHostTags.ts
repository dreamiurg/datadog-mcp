import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-host-tags");

interface GetHostTagsParams {
  host_name: string;
  source?: string;
}

interface GetHostTagsResponse {
  tags?: string[];
}

let initialized = false;

export const getHostTags = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: GetHostTagsParams) => {
    if (!initialized) {
      throw new Error("getHostTags not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.source !== undefined) {
        queryParams.append("source", params.source);
      }
      const queryString = queryParams.toString();
      const path = queryString
        ? `/api/v1/tags/hosts/${encodeURIComponent(params.host_name)}?${queryString}`
        : `/api/v1/tags/hosts/${encodeURIComponent(params.host_name)}`;
      log.debug({ host_name: params.host_name }, "Fetching host tags");
      const response = await datadogRequest<GetHostTagsResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.tags?.length ?? 0 }, "Retrieved host tags");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-host-tags failed");
      handleApiError(error, "Failed to get host tags");
    }
  },
};

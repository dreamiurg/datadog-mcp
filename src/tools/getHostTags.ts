import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("getHostTags");

interface GetHostTagsParams {
  source?: string;
}

interface GetHostTagsResponse {
  tags?: Record<string, string[]>;
}

let initialized = false;

function buildQueryString(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&");
}

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
      log.debug({ source: params.source }, "execute() called");

      const queryParams: Record<string, string | undefined> = {};
      if (params.source !== undefined) queryParams["source"] = params.source;

      const path = `/api/v1/tags/hosts${buildQueryString(queryParams)}`;

      const data = await datadogRequest<GetHostTagsResponse>({
        service: "default",
        path,
        method: "GET",
      });

      log.info({ tagCount: Object.keys(data.tags || {}).length }, "getHostTags completed");
      return data;
    } catch (error: unknown) {
      log.error({ error }, "getHostTags failed");
      handleApiError(error, "Failed to fetch host tags");
    }
  },
};

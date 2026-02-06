import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-log-indexes");

type GetLogIndexesParams = {};

interface GetLogIndexesResponse {
  indexes?: Array<{
    name?: string;
    filter?: { query?: string };
    num_retention_days?: number;
    daily_limit?: number;
    is_rate_limited?: boolean;
    num_flex_logs_retention_days?: number;
    exclusion_filters?: Array<{
      name?: string;
      filter?: { query?: string; sample_rate?: number };
      is_enabled?: boolean;
    }>;
  }>;
}

let initialized = false;

export const getLogIndexes = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "logs" });
    initialized = true;
  },

  execute: async (_params: GetLogIndexesParams) => {
    if (!initialized) {
      throw new Error("getLogIndexes not initialized. Call initialize() first.");
    }
    try {
      log.debug({}, "execute() called");
      const data = await datadogRequest<GetLogIndexesResponse>({
        service: "logs",
        path: "/api/v1/logs/config/indexes",
        method: "GET",
      });
      log.info({ indexCount: data.indexes?.length || 0 }, "get-log-indexes completed");
      return data;
    } catch (error: unknown) {
      log.error({ error }, "get-log-indexes failed");
      handleApiError(error, "Failed to retrieve log indexes");
    }
  },
};

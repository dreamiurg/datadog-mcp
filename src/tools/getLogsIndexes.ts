import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-logs-indexes");

type GetLogsIndexesParams = Record<string, never>;

interface GetLogsIndexesResponse {
  indexes?: Array<{
    name?: string;
    filter?: {
      query?: string;
    };
    num_retention_days?: number;
    daily_limit?: number;
    is_rate_limited?: boolean;
    num_flex_logs_retention_days?: number;
    exclusion_filters?: Array<{
      name?: string;
      filter?: {
        query?: string;
        sample_rate?: number;
      };
      is_enabled?: boolean;
    }>;
  }>;
}

let initialized = false;

export const getLogsIndexes = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: GetLogsIndexesParams) => {
    if (!initialized) {
      throw new Error("getLogsIndexes not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching logs indexes");
      const response = await datadogRequest<GetLogsIndexesResponse>({
        service: "default",
        path: "/api/v1/logs/config/indexes",
        method: "GET",
      });
      log.debug({ count: response.indexes?.length ?? 0 }, "Retrieved logs indexes");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-logs-indexes failed");
      handleApiError(error, "Failed to get logs indexes");
    }
  },
};

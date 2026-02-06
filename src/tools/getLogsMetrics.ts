import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-logs-metrics");

type GetLogsMetricsParams = Record<string, never>;

interface GetLogsMetricsResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      compute?: {
        aggregation_type?: string;
        include_percentiles?: boolean;
        path?: string;
      };
      filter?: {
        query?: string;
      };
      group_by?: Array<{
        path?: string;
        tag_name?: string;
      }>;
    };
  }>;
}

let initialized = false;

export const getLogsMetrics = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: GetLogsMetricsParams) => {
    if (!initialized) {
      throw new Error("getLogsMetrics not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching logs metrics");
      const response = await datadogRequest<GetLogsMetricsResponse>({
        service: "default",
        path: "/api/v2/logs/config/metrics",
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved logs metrics");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-logs-metrics failed");
      handleApiError(error, "Failed to get logs metrics");
    }
  },
};

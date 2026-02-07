import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-logs-metrics");

type ListLogsMetricsParams = Record<string, never>;

interface ListLogsMetricsResponse {
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

export const listLogsMetrics = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: ListLogsMetricsParams) => {
    if (!initialized) {
      throw new Error("listLogsMetrics not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching log-based metrics");
      const response = await datadogRequest<ListLogsMetricsResponse>({
        service: "default",
        path: "/api/v2/logs/config/metrics",
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved log-based metrics");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-logs-metrics failed");
      handleApiError(error, "Failed to list log-based metrics");
    }
  },
};

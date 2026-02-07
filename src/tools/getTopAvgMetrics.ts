import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-top-avg-metrics");

interface GetTopAvgMetricsParams {
  month?: string;
  day?: string;
  names?: string[];
  limit?: number;
  next_record_id?: string;
}

interface GetTopAvgMetricsResponse {
  usage?: Array<{
    metric_name?: string;
    avg_metric_hour?: number;
    max_metric_hour?: number;
    metric_category?: string;
  }>;
  next_record_id?: string;
}

let initialized = false;

export const getTopAvgMetrics = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: GetTopAvgMetricsParams) => {
    if (!initialized) {
      throw new Error("getTopAvgMetrics not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.month !== undefined) {
        queryParams.append("month", params.month);
      }
      if (params.day !== undefined) {
        queryParams.append("day", params.day);
      }
      if (params.names !== undefined) {
        for (const name of params.names) {
          queryParams.append("names[]", name);
        }
      }
      if (params.limit !== undefined) {
        queryParams.append("limit", params.limit.toString());
      }
      if (params.next_record_id !== undefined) {
        queryParams.append("next_record_id", params.next_record_id);
      }
      const queryString = queryParams.toString();
      const path = queryString
        ? `/api/v1/usage/top_avg_metrics?${queryString}`
        : "/api/v1/usage/top_avg_metrics";
      log.debug({ path }, "Fetching top average metrics");
      const response = await datadogRequest<GetTopAvgMetricsResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.usage?.length ?? 0 }, "Retrieved top average metrics");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-top-avg-metrics failed");
      handleApiError(error, "Failed to get top average metrics");
    }
  },
};

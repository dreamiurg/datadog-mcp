import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-spans-metrics");

type GetSpansMetricsParams = Record<string, never>;

interface GetSpansMetricsResponse {
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

export const getSpansMetrics = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: GetSpansMetricsParams) => {
    if (!initialized) {
      throw new Error("getSpansMetrics not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching spans metrics");
      const response = await datadogRequest<GetSpansMetricsResponse>({
        service: "default",
        path: "/api/v2/apm/config/metrics",
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved spans metrics");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-spans-metrics failed");
      handleApiError(error, "Failed to get spans metrics");
    }
  },
};

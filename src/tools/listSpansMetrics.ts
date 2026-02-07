import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-spans-metrics");

type ListSpansMetricsParams = Record<string, never>;

interface ListSpansMetricsResponse {
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

export const listSpansMetrics = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: ListSpansMetricsParams) => {
    if (!initialized) {
      throw new Error("listSpansMetrics not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching spans-based metrics");
      const response = await datadogRequest<ListSpansMetricsResponse>({
        service: "default",
        path: "/api/v2/apm/config/metrics",
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved spans-based metrics");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-spans-metrics failed");
      handleApiError(error, "Failed to list spans-based metrics");
    }
  },
};

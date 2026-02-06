import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("query-metrics");

interface QueryMetricsParams {
  query: string;
  from: number;
  to: number;
}

interface MetricsQueryResponse {
  status?: string;
  res_type?: string;
  series?: Array<{
    metric?: string;
    pointlist?: Array<[number, number]>;
    scope?: string;
    expression?: string;
  }>;
}

let initialized = false;

export const queryMetrics = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "metrics" });
    initialized = true;
  },

  execute: async (params: QueryMetricsParams) => {
    if (!initialized) {
      throw new Error("queryMetrics not initialized. Call initialize() first.");
    }
    try {
      const { query, from, to } = params;
      log.debug({ query, from, to }, "execute() called");
      const path = `/api/v1/query?from=${from}&to=${to}&query=${encodeURIComponent(query)}`;
      const data = await datadogRequest<MetricsQueryResponse>({
        service: "metrics",
        path,
        method: "GET",
      });
      log.info({ seriesCount: data.series?.length || 0 }, "query-metrics completed");
      return data;
    } catch (error: unknown) {
      log.error({ query: params.query, error }, "query-metrics failed");
      handleApiError(error, "querying metrics");
    }
  },
};

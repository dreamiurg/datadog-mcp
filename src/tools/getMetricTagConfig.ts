import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-metric-tag-config");

interface GetMetricTagConfigParams {
  metricName: string;
}

interface GetMetricTagConfigResponse {
  data?: {
    id?: string;
    type?: string;
    attributes?: {
      tags?: string[];
      metric_type?: string;
      aggregations?: Array<{
        time?: string;
        space?: string;
      }>;
    };
  };
}

let initialized = false;

export const getMetricTagConfig = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: GetMetricTagConfigParams): Promise<GetMetricTagConfigResponse> => {
    if (!initialized) {
      throw new Error("getMetricTagConfig not initialized. Call initialize() first.");
    }
    try {
      const path = `/api/v2/metrics/${encodeURIComponent(params.metricName)}/tags`;
      const response = await datadogRequest<GetMetricTagConfigResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.info({ metricName: params.metricName }, "Retrieved metric tag configuration");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-metric-tag-config failed");
      return handleApiError(error, "Failed to get metric tag configuration");
    }
  },
};

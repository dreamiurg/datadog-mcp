import { v1 } from "@datadog/datadog-api-client";
import { createDatadogConfiguration, createToolLogger, handleApiError } from "../lib/index.js";

const log = createToolLogger("get-metric-metadata");

interface GetMetricMetadataParams {
  metricName: string;
}

let apiInstance: v1.MetricsApi | null = null;

export const getMetricMetadata = {
  initialize: () => {
    log.debug("initialize() called");
    const configuration = createDatadogConfiguration({ service: "metrics" });
    apiInstance = new v1.MetricsApi(configuration);
  },

  execute: async (params: GetMetricMetadataParams) => {
    if (!apiInstance) {
      throw new Error("getMetricMetadata not initialized. Call initialize() first.");
    }

    try {
      const { metricName } = params;

      log.debug({ metricName }, "execute() called");
      const response = await apiInstance.getMetricMetadata({ metricName });
      log.info({ metricName }, "get-metric-metadata completed");
      return response;
    } catch (error: unknown) {
      log.error({ metricName: params.metricName, error }, "get-metric-metadata failed");
      handleApiError(error, `fetching metadata for metric ${params.metricName}`);
    }
  },
};

import { v1 } from "@datadog/datadog-api-client";
import { createDatadogConfiguration, createToolLogger, handleApiError } from "../lib/index.js";

interface GetMetricsParams {
  q?: string;
}

const log = createToolLogger("get-metrics");

let apiInstance: v1.MetricsApi | null = null;

export const getMetrics = {
  initialize: () => {
    log.debug("initialize() called");
    const configuration = createDatadogConfiguration({ service: "metrics" });
    apiInstance = new v1.MetricsApi(configuration);
  },

  execute: async (params: GetMetricsParams) => {
    if (!apiInstance) {
      throw new Error("getMetrics not initialized. Call initialize() first.");
    }

    log.debug({ query: params.q ?? "*" }, "executing get-metrics");

    try {
      const { q } = params;

      const response = await apiInstance.listMetrics({ q: q ?? "*" });
      const resultCount = Array.isArray(response) ? response.length : 1;
      log.info({ resultCount }, "get-metrics completed");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-metrics failed");
      handleApiError(error, "fetching metrics");
    }
  },
};

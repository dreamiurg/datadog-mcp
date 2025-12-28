import { v1 } from "@datadog/datadog-api-client";
import { createDatadogConfiguration, createToolLogger, handleApiError } from "../lib/index.js";

interface GetMonitorParams {
  monitorId: number;
}

const log = createToolLogger("get-monitor");

let apiInstance: v1.MonitorsApi | null = null;

export const getMonitor = {
  initialize: () => {
    log.debug("initialize() called");
    const configuration = createDatadogConfiguration({ service: "metrics" });
    apiInstance = new v1.MonitorsApi(configuration);
  },

  execute: async (params: GetMonitorParams) => {
    if (!apiInstance) {
      throw new Error("getMonitor not initialized. Call initialize() first.");
    }

    log.debug({ monitorId: params.monitorId }, "executing get-monitor");

    try {
      const { monitorId } = params;

      const response = await apiInstance.getMonitor({ monitorId });
      log.info({ monitorId }, "get-monitor completed");
      return response;
    } catch (error: unknown) {
      log.error({ monitorId: params.monitorId, error }, "get-monitor failed");
      handleApiError(error, `fetching monitor ${params.monitorId}`);
    }
  },
};

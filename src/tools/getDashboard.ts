import { v1 } from "@datadog/datadog-api-client";
import { createDatadogConfiguration, createToolLogger, handleApiError } from "../lib/index.js";

interface GetDashboardParams {
  dashboardId: string;
}

const log = createToolLogger("get-dashboard");

let apiInstance: v1.DashboardsApi | null = null;

export const getDashboard = {
  initialize: () => {
    log.debug("initialize() called");
    const configuration = createDatadogConfiguration({ service: "default" });
    apiInstance = new v1.DashboardsApi(configuration);
  },

  execute: async (params: GetDashboardParams) => {
    if (!apiInstance) {
      throw new Error("getDashboard not initialized. Call initialize() first.");
    }

    log.debug({ dashboardId: params.dashboardId }, "executing get-dashboard");

    try {
      const { dashboardId } = params;

      const response = await apiInstance.getDashboard({ dashboardId });
      log.info({ dashboardId }, "get-dashboard completed");
      return response;
    } catch (error: unknown) {
      log.error({ dashboardId: params.dashboardId, error }, "get-dashboard failed");
      handleApiError(error, `fetching dashboard ${params.dashboardId}`);
    }
  },
};

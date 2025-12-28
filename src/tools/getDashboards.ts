import { v1 } from "@datadog/datadog-api-client";
import { createDatadogConfiguration, createToolLogger, handleApiError } from "../lib/index.js";

interface GetDashboardsParams {
  filterConfigured?: boolean;
  limit?: number;
}

const log = createToolLogger("get-dashboards");

let apiInstance: v1.DashboardsApi | null = null;

export const getDashboards = {
  initialize: () => {
    log.debug("initialize() called");
    const configuration = createDatadogConfiguration({ service: "default" });
    apiInstance = new v1.DashboardsApi(configuration);
  },

  execute: async (params: GetDashboardsParams) => {
    if (!apiInstance) {
      throw new Error("getDashboards not initialized. Call initialize() first.");
    }

    log.debug({ limit: params.limit }, "executing get-dashboards");

    try {
      const { limit } = params;
      // Note: filterConfigured is accepted for API compatibility but not used
      // as the Datadog API doesn't support server-side filtering

      const response = await apiInstance.listDashboards();

      let filteredDashboards = response.dashboards ?? [];

      if (limit && filteredDashboards.length > limit) {
        filteredDashboards = filteredDashboards.slice(0, limit);
      }

      const resultCount = filteredDashboards.length;
      log.info({ resultCount }, "get-dashboards completed");

      return {
        ...response,
        dashboards: filteredDashboards,
      };
    } catch (error: unknown) {
      log.error({ error }, "get-dashboards failed");
      handleApiError(error, "fetching dashboards");
    }
  },
};

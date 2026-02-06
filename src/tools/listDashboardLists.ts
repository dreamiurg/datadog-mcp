import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-dashboard-lists");

type ListDashboardListsParams = Record<string, never>;

interface DashboardList {
  id?: number;
  name?: string;
  dashboard_count?: number;
  author?: {
    handle?: string;
    name?: string;
  };
  created?: string;
  modified?: string;
  type?: string;
}

interface ListDashboardListsResponse {
  dashboard_lists?: DashboardList[];
}

let initialized = false;

export const listDashboardLists = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: ListDashboardListsParams) => {
    if (!initialized) {
      throw new Error("listDashboardLists not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching dashboard lists");
      const response = await datadogRequest<ListDashboardListsResponse>({
        service: "default",
        path: "/api/v1/dashboard/lists/manual",
        method: "GET",
      });
      log.debug({ count: response.dashboard_lists?.length ?? 0 }, "Retrieved dashboard lists");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-dashboard-lists failed");
      handleApiError(error, "Failed to list dashboard lists");
    }
  },
};

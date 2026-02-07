import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-dora-deployments");

interface ListDORADeploymentsParams {
  filter_from?: string;
  filter_to?: string;
  filter_service?: string;
  filter_env?: string;
  page_size?: number;
  page_cursor?: string;
}

interface ListDORADeploymentsResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      service?: string;
      env?: string;
      started_at?: string;
      finished_at?: string;
      status?: string;
      version?: string;
      repository_url?: string;
    };
  }>;
  meta?: {
    page?: {
      cursor?: string;
    };
  };
}

let initialized = false;

export const listDORADeployments = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListDORADeploymentsParams) => {
    if (!initialized) {
      throw new Error("listDORADeployments not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.filter_from !== undefined) {
        queryParams.append("filter[from]", params.filter_from);
      }
      if (params.filter_to !== undefined) {
        queryParams.append("filter[to]", params.filter_to);
      }
      if (params.filter_service !== undefined) {
        queryParams.append("filter[service]", params.filter_service);
      }
      if (params.filter_env !== undefined) {
        queryParams.append("filter[env]", params.filter_env);
      }
      if (params.page_size !== undefined) {
        queryParams.append("page[size]", params.page_size.toString());
      }
      if (params.page_cursor !== undefined) {
        queryParams.append("page[cursor]", params.page_cursor);
      }
      const queryString = queryParams.toString();
      const path = queryString
        ? `/api/v2/dora/deployments?${queryString}`
        : "/api/v2/dora/deployments";
      log.debug({ path }, "Fetching DORA deployments");
      const response = await datadogRequest<ListDORADeploymentsResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved DORA deployments");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-dora-deployments failed");
      handleApiError(error, "Failed to list DORA deployments");
    }
  },
};

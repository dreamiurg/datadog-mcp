import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-workflows");

interface ListWorkflowsParams {
  page_size?: number;
  page_number?: number;
  filter_name?: string;
}

interface ListWorkflowsResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      name?: string;
      description?: string;
      status?: string;
      created_at?: string;
      modified_at?: string;
    };
  }>;
  meta?: {
    page?: {
      total_count?: number;
    };
  };
}

let initialized = false;

export const listWorkflows = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListWorkflowsParams) => {
    if (!initialized) {
      throw new Error("listWorkflows not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.page_size !== undefined) {
        queryParams.append("page[size]", params.page_size.toString());
      }
      if (params.page_number !== undefined) {
        queryParams.append("page[number]", params.page_number.toString());
      }
      if (params.filter_name !== undefined) {
        queryParams.append("filter[name]", params.filter_name);
      }
      const queryString = queryParams.toString();
      const path = queryString ? `/api/v2/workflows?${queryString}` : "/api/v2/workflows";
      log.debug({ path }, "Fetching workflows");
      const response = await datadogRequest<ListWorkflowsResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved workflows");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-workflows failed");
      handleApiError(error, "Failed to list workflows");
    }
  },
};

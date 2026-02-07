import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-processes");

interface ListProcessesParams {
  search?: string;
  tags?: string;
  page_limit?: number;
  page_cursor?: string;
}

interface ListProcessesResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      pid?: number;
      name?: string;
      host?: string;
      user?: string;
      state?: string;
      cpu_percent?: number;
      memory_percent?: number;
      tags?: string[];
    };
  }>;
  meta?: {
    pagination?: {
      next_cursor?: string;
      total_count?: number;
    };
  };
}

let initialized = false;

export const listProcesses = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListProcessesParams) => {
    if (!initialized) {
      throw new Error("listProcesses not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.search !== undefined) {
        queryParams.append("search", params.search);
      }
      if (params.tags !== undefined) {
        queryParams.append("tags", params.tags);
      }
      if (params.page_limit !== undefined) {
        queryParams.append("page[limit]", params.page_limit.toString());
      }
      if (params.page_cursor !== undefined) {
        queryParams.append("page[cursor]", params.page_cursor);
      }
      const queryString = queryParams.toString();
      const path = queryString ? `/api/v2/processes?${queryString}` : "/api/v2/processes";
      log.debug({ path }, "Fetching processes");
      const response = await datadogRequest<ListProcessesResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved processes");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-processes failed");
      handleApiError(error, "Failed to list processes");
    }
  },
};

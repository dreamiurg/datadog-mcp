import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-notebooks");

interface ListNotebooksParams {
  query?: string;
  count?: number;
  start?: number;
  sort_field?: string;
  sort_dir?: string;
  author_handle?: string;
}

interface ListNotebooksResponse {
  data?: Array<{
    id?: number;
    type?: string;
    attributes?: {
      name?: string;
      author?: { handle?: string; name?: string };
      status?: string;
      created?: string;
      modified?: string;
    };
  }>;
  meta?: {
    page?: {
      total_count?: number;
      total_filtered_count?: number;
    };
  };
}

let initialized = false;

export const listNotebooks = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListNotebooksParams) => {
    if (!initialized) {
      throw new Error("listNotebooks not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.query !== undefined) {
        queryParams.append("query", params.query);
      }
      if (params.count !== undefined) {
        queryParams.append("count", params.count.toString());
      }
      if (params.start !== undefined) {
        queryParams.append("start", params.start.toString());
      }
      if (params.sort_field !== undefined) {
        queryParams.append("sort_field", params.sort_field);
      }
      if (params.sort_dir !== undefined) {
        queryParams.append("sort_dir", params.sort_dir);
      }
      if (params.author_handle !== undefined) {
        queryParams.append("author_handle", params.author_handle);
      }
      const queryString = queryParams.toString();
      const path = queryString ? `/api/v1/notebooks?${queryString}` : "/api/v1/notebooks";
      log.debug({ path }, "Fetching notebooks");
      const response = await datadogRequest<ListNotebooksResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved notebooks");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-notebooks failed");
      handleApiError(error, "Failed to list notebooks");
    }
  },
};

import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-containers");

interface ListContainersParams {
  filter_tags?: string;
  group_by?: string;
  sort?: string;
  page_size?: number;
  page_cursor?: string;
}

interface ListContainersResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      container_id?: string;
      name?: string;
      image_name?: string;
      state?: string;
      host?: string;
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

export const listContainers = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListContainersParams) => {
    if (!initialized) {
      throw new Error("listContainers not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.filter_tags !== undefined) {
        queryParams.append("filter[tags]", params.filter_tags);
      }
      if (params.group_by !== undefined) {
        queryParams.append("group_by", params.group_by);
      }
      if (params.sort !== undefined) {
        queryParams.append("sort", params.sort);
      }
      if (params.page_size !== undefined) {
        queryParams.append("page[size]", params.page_size.toString());
      }
      if (params.page_cursor !== undefined) {
        queryParams.append("page[cursor]", params.page_cursor);
      }
      const queryString = queryParams.toString();
      const path = queryString ? `/api/v2/containers?${queryString}` : "/api/v2/containers";
      log.debug({ path }, "Fetching containers");
      const response = await datadogRequest<ListContainersResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved containers");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-containers failed");
      handleApiError(error, "Failed to list containers");
    }
  },
};

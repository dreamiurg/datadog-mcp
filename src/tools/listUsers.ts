import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-users");

interface ListUsersParams {
  pageSize?: number;
  pageNumber?: number;
  sort?: string;
  sortDir?: string;
  filter?: string;
  filterStatus?: string; // "Active", "Pending", "Disabled"
}

interface ListUsersResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      name?: string;
      handle?: string;
      email?: string;
      status?: string;
      title?: string;
      created_at?: string;
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

export const listUsers = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListUsersParams): Promise<ListUsersResponse> => {
    if (!initialized) {
      throw new Error("listUsers not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.pageSize !== undefined) {
        queryParams.append("page[size]", String(params.pageSize));
      }
      if (params.pageNumber !== undefined) {
        queryParams.append("page[number]", String(params.pageNumber));
      }
      if (params.sort !== undefined) {
        queryParams.append("sort", params.sort);
      }
      if (params.sortDir !== undefined) {
        queryParams.append("sort_dir", params.sortDir);
      }
      if (params.filter !== undefined) {
        queryParams.append("filter", params.filter);
      }
      if (params.filterStatus !== undefined) {
        queryParams.append("filter[status]", params.filterStatus);
      }

      const queryString = queryParams.toString();
      const path = queryString ? `/api/v2/users?${queryString}` : "/api/v2/users";

      log.debug({ path }, "Fetching users");
      const response = await datadogRequest<ListUsersResponse>({
        service: "default",
        path,
        method: "GET",
      });

      log.info({ userCount: response.data?.length ?? 0 }, "Successfully retrieved users");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-users failed");
      return handleApiError(error, "Failed to list users");
    }
  },
};

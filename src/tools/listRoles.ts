import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-roles");

interface ListRolesParams {
  page_size?: number;
  page_number?: number;
  filter?: string;
}

interface ListRolesResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      name?: string;
      created_at?: string;
      modified_at?: string;
      user_count?: number;
    };
  }>;
}

let initialized = false;

export const listRoles = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListRolesParams) => {
    if (!initialized) {
      throw new Error("listRoles not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.page_size !== undefined) {
        queryParams.append("page[size]", params.page_size.toString());
      }
      if (params.page_number !== undefined) {
        queryParams.append("page[number]", params.page_number.toString());
      }
      if (params.filter !== undefined) {
        queryParams.append("filter", params.filter);
      }
      const queryString = queryParams.toString();
      const path = queryString ? `/api/v2/roles?${queryString}` : "/api/v2/roles";
      log.debug({ path }, "Fetching roles");
      const response = await datadogRequest<ListRolesResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved roles");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-roles failed");
      handleApiError(error, "Failed to list roles");
    }
  },
};

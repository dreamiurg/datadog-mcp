import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-app-keys");

interface ListAppKeysParams {
  pageSize?: number;
  pageNumber?: number;
  sort?: string;
  filterName?: string;
}

interface ListAppKeysResponse {
  data?: unknown[];
  meta?: {
    page?: {
      total_count?: number;
    };
  };
}

let initialized = false;

export const listAppKeys = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListAppKeysParams): Promise<ListAppKeysResponse> => {
    if (!initialized) {
      throw new Error("listAppKeys not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.pageSize) queryParams.append("page[size]", params.pageSize.toString());
      if (params.pageNumber !== undefined)
        queryParams.append("page[number]", params.pageNumber.toString());
      if (params.sort) queryParams.append("sort", params.sort);
      if (params.filterName) queryParams.append("filter[name]", params.filterName);

      const path = `/api/v2/current_user/application_keys${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await datadogRequest<ListAppKeysResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.info({ count: response.data?.length ?? 0 }, "Listed application keys");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-app-keys failed");
      return handleApiError(error, "Failed to list application keys");
    }
  },
};

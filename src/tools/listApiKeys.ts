import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-api-keys");

interface ListApiKeysParams {
  page_size?: number;
  page_number?: number;
  filter?: string;
  sort?: string;
}

interface ListApiKeysResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      name?: string;
      key?: string;
      created_at?: string;
      modified_at?: string;
      last4?: string;
    };
  }>;
}

let initialized = false;

export const listApiKeys = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListApiKeysParams) => {
    if (!initialized) {
      throw new Error("listApiKeys not initialized. Call initialize() first.");
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
      if (params.sort !== undefined) {
        queryParams.append("sort", params.sort);
      }
      const queryString = queryParams.toString();
      const path = queryString ? `/api/v2/api_keys?${queryString}` : "/api/v2/api_keys";
      log.debug({ path }, "Fetching API keys");
      const response = await datadogRequest<ListApiKeysResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved API keys");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-api-keys failed");
      handleApiError(error, "Failed to list API keys");
    }
  },
};

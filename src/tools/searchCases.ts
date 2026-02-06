import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("search-cases");

interface SearchCasesParams {
  page_size?: number;
  page_offset?: number;
  sort_field?: string;
  filter?: string;
  sort_asc?: boolean;
}

interface SearchCasesResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      title?: string;
      description?: string;
      status?: string;
      type?: string;
      priority?: string;
      created_at?: string;
      modified_at?: string;
      key?: string;
    };
  }>;
}

let initialized = false;

export const searchCases = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: SearchCasesParams) => {
    if (!initialized) {
      throw new Error("searchCases not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.page_size !== undefined) {
        queryParams.append("page[size]", params.page_size.toString());
      }
      if (params.page_offset !== undefined) {
        queryParams.append("page[offset]", params.page_offset.toString());
      }
      if (params.sort_field !== undefined) {
        queryParams.append("sort_field", params.sort_field);
      }
      if (params.filter !== undefined) {
        queryParams.append("filter", params.filter);
      }
      if (params.sort_asc !== undefined) {
        queryParams.append("sort_asc", params.sort_asc.toString());
      }
      const queryString = queryParams.toString();
      const path = queryString ? `/api/v2/cases?${queryString}` : "/api/v2/cases";
      log.debug({ path }, "Searching cases");
      const response = await datadogRequest<SearchCasesResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved cases");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "search-cases failed");
      handleApiError(error, "Failed to search cases");
    }
  },
};

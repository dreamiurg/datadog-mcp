import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("search-slos");

interface SearchSLOsParams {
  query?: string;
  page_size?: number;
  page_number?: number;
  include_facets?: boolean;
}

interface SearchSLOsResponse {
  data?: {
    attributes?: {
      slos?: Array<{
        data?: {
          id?: string;
          attributes?: {
            name?: string;
            description?: string;
            target_threshold?: number;
            timeframe?: string;
            type?: string;
            overall_status?: Array<{ status?: string }>;
          };
        };
      }>;
      facets?: Record<string, unknown>;
    };
  };
  meta?: {
    pagination?: {
      total_count?: number;
    };
  };
}

let initialized = false;

export const searchSLOs = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: SearchSLOsParams) => {
    if (!initialized) {
      throw new Error("searchSLOs not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.query !== undefined) {
        queryParams.append("query", params.query);
      }
      if (params.page_size !== undefined) {
        queryParams.append("page[size]", params.page_size.toString());
      }
      if (params.page_number !== undefined) {
        queryParams.append("page[number]", params.page_number.toString());
      }
      if (params.include_facets !== undefined) {
        queryParams.append("include_facets", params.include_facets.toString());
      }
      const queryString = queryParams.toString();
      const path = queryString ? `/api/v1/slo/search?${queryString}` : "/api/v1/slo/search";
      log.debug({ query: params.query }, "Searching SLOs");
      const response = await datadogRequest<SearchSLOsResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug("Retrieved SLO search results");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "search-slos failed");
      handleApiError(error, "Failed to search SLOs");
    }
  },
};

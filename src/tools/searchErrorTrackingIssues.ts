import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("search-error-tracking-issues");

interface SearchErrorTrackingIssuesParams {
  filter_query?: string;
  filter_from?: string;
  filter_to?: string;
  page_limit?: number;
  page_cursor?: string;
  sort?: string;
}

interface SearchErrorTrackingIssuesResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      title?: string;
      status?: string;
      level?: string;
      first_seen?: string;
      last_seen?: string;
      count?: number;
      impacted_accounts?: number;
    };
  }>;
  meta?: {
    page?: {
      after?: string;
    };
  };
}

let initialized = false;

export const searchErrorTrackingIssues = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: SearchErrorTrackingIssuesParams) => {
    if (!initialized) {
      throw new Error("searchErrorTrackingIssues not initialized. Call initialize() first.");
    }
    try {
      const body: Record<string, unknown> = {};
      const filter: Record<string, unknown> = {};
      if (params.filter_query !== undefined) filter.query = params.filter_query;
      if (params.filter_from !== undefined) filter.from = params.filter_from;
      if (params.filter_to !== undefined) filter.to = params.filter_to;
      if (Object.keys(filter).length > 0) body.filter = filter;
      const page: Record<string, unknown> = {};
      if (params.page_limit !== undefined) page.limit = params.page_limit;
      if (params.page_cursor !== undefined) page.cursor = params.page_cursor;
      if (Object.keys(page).length > 0) body.page = page;
      if (params.sort !== undefined) body.sort = params.sort;
      log.debug({ query: params.filter_query }, "Searching error tracking issues");
      const response = await datadogRequest<SearchErrorTrackingIssuesResponse>({
        service: "default",
        path: "/api/v2/error_tracking/issues/search",
        method: "POST",
        body,
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved error tracking issues");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "search-error-tracking-issues failed");
      handleApiError(error, "Failed to search error tracking issues");
    }
  },
};

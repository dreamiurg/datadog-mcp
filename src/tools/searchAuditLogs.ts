import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("search-audit-logs");

interface SearchAuditLogsParams {
  filter_query?: string;
  filter_from?: string;
  filter_to?: string;
  page_limit?: number;
  page_cursor?: string;
  sort?: string;
}

interface SearchAuditLogsResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      timestamp?: string;
      service?: string;
      message?: string;
      attributes?: Record<string, unknown>;
      tags?: string[];
    };
  }>;
  meta?: {
    page?: {
      after?: string;
    };
  };
}

let initialized = false;

export const searchAuditLogs = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: SearchAuditLogsParams) => {
    if (!initialized) {
      throw new Error("searchAuditLogs not initialized. Call initialize() first.");
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
      log.debug({ query: params.filter_query }, "Searching audit logs");
      const response = await datadogRequest<SearchAuditLogsResponse>({
        service: "default",
        path: "/api/v2/audit/events/search",
        method: "POST",
        body,
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved audit logs");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "search-audit-logs failed");
      handleApiError(error, "Failed to search audit logs");
    }
  },
};

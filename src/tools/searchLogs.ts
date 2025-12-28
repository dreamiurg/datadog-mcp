import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";
import type { LogsSearchResponse } from "../lib/types.js";

const log = createToolLogger("search-logs");

interface SearchLogsParams {
  filter?: {
    query?: string;
    from?: string;
    to?: string;
    indexes?: string[];
  };
  sort?: string;
  page?: {
    limit?: number;
    cursor?: string;
  };
  limit?: number;
}

// We still need to call initialize() for API compatibility,
// but the configuration is created per-request for the HTTP client
let initialized = false;

export const searchLogs = {
  initialize: () => {
    log.debug("initialize() called");
    // Validate that configuration can be created (this checks env vars)
    createDatadogConfiguration({
      service: "logs",
      unstableOperations: ["v2.listLogsGet"],
    });
    initialized = true;
  },

  execute: async (params: SearchLogsParams) => {
    if (!initialized) {
      throw new Error("searchLogs not initialized. Call initialize() first.");
    }

    try {
      const { filter, sort, page, limit } = params;

      log.debug({ query: filter?.query, from: filter?.from, to: filter?.to }, "execute() called");
      const body = { filter, sort, page };

      const data = await datadogRequest<LogsSearchResponse>({
        service: "logs",
        path: "/api/v2/logs/events/search",
        method: "POST",
        body,
      });

      if (limit && data.data && data.data.length > limit) {
        data.data = data.data.slice(0, limit);
      }

      log.info({ resultCount: data.data?.length || 0 }, "search-logs completed");
      return data;
    } catch (error: unknown) {
      log.error({ query: params.filter?.query, error }, "search-logs failed");
      handleApiError(error, "searching logs");
    }
  },
};

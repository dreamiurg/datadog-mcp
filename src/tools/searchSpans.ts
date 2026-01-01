import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";
import type { SpansSearchResponse } from "../lib/types.js";

const log = createToolLogger("search-spans");

interface SearchSpansParams {
  filter?: {
    query?: string;
    from?: string;
    to?: string;
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

export const searchSpans = {
  initialize: () => {
    log.debug("initialize() called");
    // Validate that configuration can be created (this checks env vars)
    createDatadogConfiguration({
      service: "apm",
    });
    initialized = true;
  },

  execute: async (params: SearchSpansParams) => {
    if (!initialized) {
      throw new Error("searchSpans not initialized. Call initialize() first.");
    }

    try {
      const { filter, sort, page, limit } = params;

      log.debug({ query: filter?.query, from: filter?.from, to: filter?.to }, "execute() called");
      const body = { filter, sort, page };

      const data = await datadogRequest<SpansSearchResponse>({
        service: "apm",
        path: "/api/v2/spans/events/search",
        method: "POST",
        body,
      });

      if (limit && data.data && data.data.length > limit) {
        data.data = data.data.slice(0, limit);
      }

      log.info({ resultCount: data.data?.length || 0 }, "search-spans completed");
      return data;
    } catch (error: unknown) {
      log.error({ query: params.filter?.query, error }, "search-spans failed");
      handleApiError(error, "searching spans");
    }
  },
};

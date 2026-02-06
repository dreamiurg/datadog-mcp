import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("search-rum-events");

interface SearchRumEventsParams {
  filter?: { query?: string; from?: string; to?: string };
  sort?: string;
  page?: { limit?: number; cursor?: string };
  limit?: number;
}

interface RumEventsSearchResponse {
  data?: Array<{ id?: string; type?: string; attributes?: Record<string, unknown> }>;
  meta?: { page?: { after?: string } };
  links?: { next?: string };
}

let initialized = false;

export const searchRumEvents = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },

  execute: async (params: SearchRumEventsParams) => {
    if (!initialized) {
      throw new Error("searchRumEvents not initialized. Call initialize() first.");
    }
    try {
      const { filter, sort, page, limit } = params;
      log.debug({ query: filter?.query }, "execute() called");
      const body = { filter, sort, page };
      const data = await datadogRequest<RumEventsSearchResponse>({
        service: "default",
        path: "/api/v2/rum/events/search",
        method: "POST",
        body,
      });
      if (limit && data.data && data.data.length > limit) {
        data.data = data.data.slice(0, limit);
      }
      log.info({ resultCount: data.data?.length || 0 }, "search-rum-events completed");
      return data;
    } catch (error: unknown) {
      log.error({ query: params.filter?.query, error }, "search-rum-events failed");
      handleApiError(error, "searching RUM events");
    }
  },
};

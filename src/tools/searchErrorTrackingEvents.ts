import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("searchErrorTrackingEvents");

interface SearchErrorTrackingEventsParams {
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

interface ErrorTrackingEvent {
  id?: string;
  type?: string;
  attributes?: {
    title?: string;
    message?: string;
    error_type?: string;
    service?: string;
    env?: string;
    first_seen?: string;
    last_seen?: string;
    count?: number;
  };
}

interface SearchErrorTrackingEventsResponse {
  data?: ErrorTrackingEvent[];
  meta?: {
    page?: {
      after?: string;
    };
  };
}

let initialized = false;

export const searchErrorTrackingEvents = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },

  execute: async (params: SearchErrorTrackingEventsParams) => {
    if (!initialized) {
      throw new Error("searchErrorTrackingEvents not initialized. Call initialize() first.");
    }
    try {
      log.debug(
        {
          query: params.filter?.query,
          from: params.filter?.from,
          to: params.filter?.to,
          sort: params.sort,
          limit: params.limit,
        },
        "execute() called",
      );

      const body: {
        filter?: SearchErrorTrackingEventsParams["filter"];
        sort?: string;
        page?: SearchErrorTrackingEventsParams["page"];
      } = {};

      if (params.filter) body.filter = params.filter;
      if (params.sort) body.sort = params.sort;
      if (params.page) body.page = params.page;

      const data = await datadogRequest<SearchErrorTrackingEventsResponse>({
        service: "default",
        path: "/api/v2/error-tracking/events/search",
        method: "POST",
        body,
      });

      // Apply client-side limit truncation
      if (params.limit && data.data && data.data.length > params.limit) {
        data.data = data.data.slice(0, params.limit);
      }

      log.info({ resultCount: data.data?.length || 0 }, "searchErrorTrackingEvents completed");
      return data;
    } catch (error: unknown) {
      log.error({ error }, "searchErrorTrackingEvents failed");
      handleApiError(error, "Failed to search error tracking events");
    }
  },
};

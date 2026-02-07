import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("search-incidents");

interface SearchIncidentsParams {
  query: string;
  filter_created_start?: string;
  filter_created_end?: string;
  page_size?: number;
  page_offset?: number;
  sort?: string;
}

interface SearchIncidentsResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      title?: string;
      severity?: string;
      status?: string;
      created?: string;
      modified?: string;
      commander?: { handle?: string };
      fields?: Record<string, unknown>;
    };
  }>;
  meta?: {
    pagination?: {
      offset?: number;
      size?: number;
    };
  };
}

let initialized = false;

export const searchIncidents = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: SearchIncidentsParams) => {
    if (!initialized) {
      throw new Error("searchIncidents not initialized. Call initialize() first.");
    }
    try {
      const body: Record<string, unknown> = {};
      body.query = params.query;
      const filter: Record<string, unknown> = {};
      if (params.filter_created_start !== undefined) {
        filter.created_start = params.filter_created_start;
      }
      if (params.filter_created_end !== undefined) {
        filter.created_end = params.filter_created_end;
      }
      if (Object.keys(filter).length > 0) body.filter = filter;
      const page: Record<string, unknown> = {};
      if (params.page_size !== undefined) page.size = params.page_size;
      if (params.page_offset !== undefined) page.offset = params.page_offset;
      if (Object.keys(page).length > 0) body.page = page;
      if (params.sort !== undefined) body.sort = params.sort;
      log.debug({ query: params.query }, "Searching incidents");
      const response = await datadogRequest<SearchIncidentsResponse>({
        service: "default",
        path: "/api/v2/incidents/search",
        method: "POST",
        body,
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved incidents");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "search-incidents failed");
      handleApiError(error, "Failed to search incidents");
    }
  },
};

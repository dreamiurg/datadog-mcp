import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("getNotebooks");

interface GetNotebooksParams {
  authorHandle?: string;
  excludeAuthorHandle?: string;
  count?: number;
  start?: number;
  sortField?: string;
  sortDir?: string;
  query?: string;
  includeCells?: boolean;
  isTemplate?: boolean;
  type?: string;
}

interface GetNotebooksResponse {
  data?: Array<{
    id?: number;
    type?: string;
    attributes?: {
      name?: string;
      author?: {
        handle?: string;
        name?: string;
      };
      created?: string;
      modified?: string;
      status?: string;
      metadata?: Record<string, unknown>;
    };
  }>;
  meta?: {
    page?: {
      total_count?: number;
      total_filtered_count?: number;
    };
  };
}

let initialized = false;

function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&");
}

export const getNotebooks = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },

  execute: async (params: GetNotebooksParams) => {
    if (!initialized) {
      throw new Error("getNotebooks not initialized. Call initialize() first.");
    }
    try {
      log.debug(
        {
          authorHandle: params.authorHandle,
          count: params.count,
          query: params.query,
        },
        "execute() called",
      );

      const queryParams: Record<string, string | number | boolean | undefined> = {};
      if (params.authorHandle !== undefined) queryParams["author_handle"] = params.authorHandle;
      if (params.excludeAuthorHandle !== undefined)
        queryParams["exclude_author_handle"] = params.excludeAuthorHandle;
      if (params.count !== undefined) queryParams["count"] = params.count;
      if (params.start !== undefined) queryParams["start"] = params.start;
      if (params.sortField !== undefined) queryParams["sort_field"] = params.sortField;
      if (params.sortDir !== undefined) queryParams["sort_dir"] = params.sortDir;
      if (params.query !== undefined) queryParams["query"] = params.query;
      if (params.includeCells !== undefined) queryParams["include_cells"] = params.includeCells;
      if (params.isTemplate !== undefined) queryParams["is_template"] = params.isTemplate;
      if (params.type !== undefined) queryParams["type"] = params.type;

      const path = `/api/v1/notebooks${buildQueryString(queryParams)}`;

      const data = await datadogRequest<GetNotebooksResponse>({
        service: "default",
        path,
        method: "GET",
      });

      log.info({ resultCount: data.data?.length || 0 }, "getNotebooks completed");
      return data;
    } catch (error: unknown) {
      log.error({ error }, "getNotebooks failed");
      handleApiError(error, "Failed to fetch notebooks");
    }
  },
};

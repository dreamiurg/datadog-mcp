import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("getContainers");

interface GetContainersParams {
  filterTags?: string;
  groupBy?: string;
  sort?: string;
  pageSize?: number;
  pageCursor?: string;
}

interface GetContainersResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      name?: string;
      image_name?: string;
      image_tag?: string;
      state?: string;
      started_at?: string;
      tags?: string[];
    };
  }>;
  meta?: {
    pagination?: {
      next_cursor?: string;
      total?: number;
    };
  };
}

let initialized = false;

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&");
}

export const getContainers = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },

  execute: async (params: GetContainersParams) => {
    if (!initialized) {
      throw new Error("getContainers not initialized. Call initialize() first.");
    }
    try {
      log.debug(
        {
          filterTags: params.filterTags,
          groupBy: params.groupBy,
          sort: params.sort,
          pageSize: params.pageSize,
        },
        "execute() called",
      );

      const queryParams: Record<string, string | number | undefined> = {};
      if (params.filterTags !== undefined) queryParams["filter[tags]"] = params.filterTags;
      if (params.groupBy !== undefined) queryParams["group_by"] = params.groupBy;
      if (params.sort !== undefined) queryParams["sort"] = params.sort;
      if (params.pageSize !== undefined) queryParams["page[size]"] = params.pageSize;
      if (params.pageCursor !== undefined) queryParams["page[cursor]"] = params.pageCursor;

      const path = `/api/v2/containers${buildQueryString(queryParams)}`;

      const data = await datadogRequest<GetContainersResponse>({
        service: "default",
        path,
        method: "GET",
      });

      log.info({ resultCount: data.data?.length || 0 }, "getContainers completed");
      return data;
    } catch (error: unknown) {
      log.error({ error }, "getContainers failed");
      handleApiError(error, "Failed to fetch containers");
    }
  },
};

import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-ci-pipelines");

interface ListCIPipelinesParams {
  filterQuery?: string;
  filterFrom?: string; // ISO 8601 timestamp
  filterTo?: string;
  pageLimit?: number;
  pageCursor?: string;
  sort?: string;
}

interface ListCIPipelinesResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: Record<string, unknown>;
  }>;
  links?: {
    next?: string;
  };
  meta?: Record<string, unknown>;
}

let initialized = false;

export const listCIPipelines = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListCIPipelinesParams): Promise<ListCIPipelinesResponse> => {
    if (!initialized) {
      throw new Error("listCIPipelines not initialized. Call initialize() first.");
    }

    try {
      const queryParams = new URLSearchParams();

      if (params.filterQuery !== undefined) {
        queryParams.append("filter[query]", params.filterQuery);
      }
      if (params.filterFrom !== undefined) {
        queryParams.append("filter[from]", params.filterFrom);
      }
      if (params.filterTo !== undefined) {
        queryParams.append("filter[to]", params.filterTo);
      }
      if (params.pageLimit !== undefined) {
        queryParams.append("page[limit]", String(params.pageLimit));
      }
      if (params.pageCursor !== undefined) {
        queryParams.append("page[cursor]", params.pageCursor);
      }
      if (params.sort !== undefined) {
        queryParams.append("sort", params.sort);
      }

      const queryString = queryParams.toString();
      const path = `/api/v2/ci/pipelines/events${queryString ? `?${queryString}` : ""}`;

      log.debug({ path, params }, "Listing CI pipeline events");

      const response = await datadogRequest<ListCIPipelinesResponse>({
        method: "GET",
        path,
        service: "default",
      });

      log.info({ count: response.data?.length }, "Successfully listed CI pipeline events");

      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-ci-pipelines failed");
      handleApiError(error, "Failed to list CI pipeline events from Datadog");
    }
  },
};

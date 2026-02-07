import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-ci-tests");

interface ListCITestsParams {
  filterQuery?: string;
  filterFrom?: string;
  filterTo?: string;
  pageLimit?: number;
  pageCursor?: string;
  sort?: string;
}

interface ListCITestsResponse {
  data?: unknown[];
  meta?: {
    page?: {
      after?: string;
    };
  };
}

let initialized = false;

export const listCITests = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListCITestsParams): Promise<ListCITestsResponse> => {
    if (!initialized) {
      throw new Error("listCITests not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.filterQuery) queryParams.append("filter[query]", params.filterQuery);
      if (params.filterFrom) queryParams.append("filter[from]", params.filterFrom);
      if (params.filterTo) queryParams.append("filter[to]", params.filterTo);
      if (params.pageLimit) queryParams.append("page[limit]", params.pageLimit.toString());
      if (params.pageCursor) queryParams.append("page[cursor]", params.pageCursor);
      if (params.sort) queryParams.append("sort", params.sort);

      const path = `/api/v2/ci/tests/events${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await datadogRequest<ListCITestsResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.info({ count: response.data?.length ?? 0 }, "Listed CI test events");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-ci-tests failed");
      return handleApiError(error, "Failed to list CI test events from Datadog");
    }
  },
};

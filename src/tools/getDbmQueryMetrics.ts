import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-dbm-query-metrics");

interface GetDbmQueryMetricsParams {
  filterDbType?: string;
  filterHost?: string;
  filterQuery?: string;
  filterFrom?: string;
  filterTo?: string;
  pageLimit?: number;
  pageCursor?: string;
}

interface GetDbmQueryMetricsResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      query?: string;
      host?: string;
      db_type?: string;
      total_time?: number;
      count?: number;
    };
  }>;
  meta?: {
    pagination?: {
      next_cursor?: string;
    };
  };
}

let initialized = false;

export const getDbmQueryMetrics = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: GetDbmQueryMetricsParams): Promise<GetDbmQueryMetricsResponse> => {
    if (!initialized) {
      throw new Error("getDbmQueryMetrics not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.filterDbType) {
        queryParams.append("filter[db_type]", params.filterDbType);
      }
      if (params.filterHost) {
        queryParams.append("filter[host]", params.filterHost);
      }
      if (params.filterQuery) {
        queryParams.append("filter[query]", params.filterQuery);
      }
      if (params.filterFrom) {
        queryParams.append("filter[from]", params.filterFrom);
      }
      if (params.filterTo) {
        queryParams.append("filter[to]", params.filterTo);
      }
      if (params.pageLimit !== undefined) {
        queryParams.append("page[limit]", String(params.pageLimit));
      }
      if (params.pageCursor) {
        queryParams.append("page[cursor]", params.pageCursor);
      }

      const path = `/api/v2/dbm/metrics/query${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await datadogRequest<GetDbmQueryMetricsResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.info({ count: response.data?.length ?? 0 }, "Retrieved DBM query metrics");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-dbm-query-metrics failed");
      return handleApiError(error, "Failed to get DBM query metrics");
    }
  },
};

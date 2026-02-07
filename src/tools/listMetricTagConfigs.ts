import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-metric-tag-configs");

interface ListMetricTagConfigsParams {
  filterConfigured?: boolean;
  filterTagsConfigured?: string;
  filterMetric?: string;
  filterActiveWithin?: number;
  windowSeconds?: number;
  pageSize?: number;
  pageCursor?: string;
}

interface ListMetricTagConfigsResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      tags?: string[];
      metric_type?: string;
      aggregations?: Array<{
        time?: string;
        space?: string;
      }>;
    };
  }>;
  meta?: {
    pagination?: {
      next_cursor?: string;
    };
  };
}

let initialized = false;

export const listMetricTagConfigs = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListMetricTagConfigsParams): Promise<ListMetricTagConfigsResponse> => {
    if (!initialized) {
      throw new Error("listMetricTagConfigs not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.filterConfigured !== undefined) {
        queryParams.append("filter[configured]", String(params.filterConfigured));
      }
      if (params.filterTagsConfigured) {
        queryParams.append("filter[tags_configured]", params.filterTagsConfigured);
      }
      if (params.filterMetric) {
        queryParams.append("filter[metric]", params.filterMetric);
      }
      if (params.filterActiveWithin !== undefined) {
        queryParams.append("filter[active_within]", String(params.filterActiveWithin));
      }
      if (params.windowSeconds !== undefined) {
        queryParams.append("window[seconds]", String(params.windowSeconds));
      }
      if (params.pageSize !== undefined) {
        queryParams.append("page[size]", String(params.pageSize));
      }
      if (params.pageCursor) {
        queryParams.append("page[cursor]", params.pageCursor);
      }

      const path = `/api/v2/metrics${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await datadogRequest<ListMetricTagConfigsResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.info({ count: response.data?.length ?? 0 }, "Retrieved metric tag configurations");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-metric-tag-configs failed");
      return handleApiError(error, "Failed to list metric tag configurations");
    }
  },
};

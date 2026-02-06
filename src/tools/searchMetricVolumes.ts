import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("search-metric-volumes");

interface SearchMetricVolumesParams {
  filterMetric?: string;
  filterConfigured?: boolean;
  filterTagsConfigured?: string;
  filterActiveWithin?: number;
  windowSeconds?: number;
}

interface MetricVolume {
  id?: string;
  type?: string;
  attributes?: {
    ingested_volume?: number;
    indexed_volume?: number;
    percentile_volume?: number;
  };
}

interface SearchMetricVolumesResponse {
  data?: MetricVolume[];
  meta?: {
    pagination?: {
      next_cursor?: string;
    };
  };
}

let initialized = false;

export const searchMetricVolumes = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: SearchMetricVolumesParams) => {
    if (!initialized) {
      throw new Error("searchMetricVolumes not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.filterMetric !== undefined) {
        queryParams.append("filter[metric]", params.filterMetric);
      }
      if (params.filterConfigured !== undefined) {
        queryParams.append("filter[configured]", String(params.filterConfigured));
      }
      if (params.filterTagsConfigured !== undefined) {
        queryParams.append("filter[tags_configured]", params.filterTagsConfigured);
      }
      if (params.filterActiveWithin !== undefined) {
        queryParams.append("filter[active_within]", String(params.filterActiveWithin));
      }
      if (params.windowSeconds !== undefined) {
        queryParams.append("window[seconds]", String(params.windowSeconds));
      }

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/api/v2/metrics?${queryString}` : "/api/v2/metrics";

      log.debug({ params, endpoint }, "Searching metric volumes");
      const response = await datadogRequest<SearchMetricVolumesResponse>({
        service: "default",
        path: endpoint,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved metric volumes");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "search-metric-volumes failed");
      handleApiError(error, "Failed to search metric volumes");
    }
  },
};

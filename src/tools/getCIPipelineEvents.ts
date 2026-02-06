import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-ci-pipeline-events");

interface GetCIPipelineEventsParams {
  compute: Array<{
    aggregation: string;
    metric?: string;
    type?: string;
  }>;
  filter?: {
    query?: string;
    from?: string;
    to?: string;
  };
  group_by?: Array<{
    facet: string;
    limit?: number;
  }>;
}

interface GetCIPipelineEventsResponse {
  data?: {
    buckets?: Array<{
      computes?: Record<string, unknown>;
      by?: Record<string, string>;
    }>;
  };
  meta?: Record<string, unknown>;
}

let initialized = false;

export const getCIPipelineEvents = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: GetCIPipelineEventsParams) => {
    if (!initialized) {
      throw new Error("getCIPipelineEvents not initialized. Call initialize() first.");
    }
    try {
      log.debug({ params }, "Aggregating CI pipeline analytics");
      const response = await datadogRequest<GetCIPipelineEventsResponse>({
        service: "default",
        path: "/api/v2/ci/pipelines/analytics",
        method: "POST",
        body: params,
      });
      log.debug(
        { buckets: response.data?.buckets?.length ?? 0 },
        "Retrieved CI pipeline analytics",
      );
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-ci-pipeline-events failed");
      handleApiError(error, "Failed to aggregate CI pipeline analytics");
    }
  },
};

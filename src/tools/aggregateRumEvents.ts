import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("aggregate-rum-events");

interface AggregateRumEventsParams {
  compute: Array<{ aggregation: string; metric?: string; type?: string }>;
  filter?: { query?: string; from?: string; to?: string };
  group_by?: Array<{
    facet: string;
    limit?: number;
    sort?: { aggregation: string; order?: string };
  }>;
}

interface AggregateRumEventsResponse {
  data?: { buckets?: Array<{ computes?: Record<string, unknown>; by?: Record<string, string> }> };
  meta?: Record<string, unknown>;
}

let initialized = false;

export const aggregateRumEvents = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },

  execute: async (params: AggregateRumEventsParams) => {
    if (!initialized) {
      throw new Error("aggregateRumEvents not initialized. Call initialize() first.");
    }
    try {
      const { compute, filter, group_by } = params;
      log.debug({ compute, filter, group_by }, "execute() called");
      const body = { compute, filter, group_by };
      const data = await datadogRequest<AggregateRumEventsResponse>({
        service: "default",
        path: "/api/v2/rum/analytics/aggregate",
        method: "POST",
        body,
      });
      log.info({ bucketCount: data.data?.buckets?.length || 0 }, "aggregate-rum-events completed");
      return data;
    } catch (error: unknown) {
      log.error({ error }, "aggregate-rum-events failed");
      handleApiError(error, "aggregating RUM events");
    }
  },
};

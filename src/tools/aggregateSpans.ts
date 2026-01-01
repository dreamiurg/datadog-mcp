import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";
import type { SpansAggregateResponse } from "../lib/types.js";

const log = createToolLogger("aggregate-spans");

interface AggregateSpansParams {
  filter?: {
    query?: string;
    from?: string;
    to?: string;
  };
  compute?: Array<{
    aggregation: string;
    metric?: string;
    type?: string;
  }>;
  groupBy?: Array<{
    facet: string;
    limit?: number;
    sort?: {
      aggregation: string;
      order: string;
    };
  }>;
  options?: {
    timezone?: string;
  };
}

// We still need to call initialize() for API compatibility,
// but the configuration is created per-request for the HTTP client
let initialized = false;

export const aggregateSpans = {
  initialize: () => {
    log.debug("initialize() called");
    // Validate that configuration can be created (this checks env vars)
    createDatadogConfiguration({
      service: "apm",
    });
    initialized = true;
  },

  execute: async (params: AggregateSpansParams) => {
    if (!initialized) {
      throw new Error("aggregateSpans not initialized. Call initialize() first.");
    }

    try {
      const { filter, compute, groupBy, options } = params;

      log.debug(
        {
          query: filter?.query,
          from: filter?.from,
          to: filter?.to,
          computeCount: compute?.length || 0,
          groupByCount: groupBy?.length || 0,
        },
        "execute() called",
      );
      const body = {
        filter,
        compute,
        group_by: groupBy,
        options,
      };

      const data = await datadogRequest<SpansAggregateResponse>({
        service: "apm",
        path: "/api/v2/spans/analytics/aggregate",
        method: "POST",
        body,
      });

      log.info({ bucketCount: data.data?.buckets?.length || 0 }, "aggregate-spans completed");
      return data;
    } catch (error: unknown) {
      log.error({ query: params.filter?.query, error }, "aggregate-spans failed");
      handleApiError(error, "aggregating spans");
    }
  },
};

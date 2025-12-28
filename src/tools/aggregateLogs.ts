import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";
import type { LogsAggregateResponse } from "../lib/types.js";

const log = createToolLogger("aggregate-logs");

interface AggregateLogsParams {
  filter?: {
    query?: string;
    from?: string;
    to?: string;
    indexes?: string[];
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

export const aggregateLogs = {
  initialize: () => {
    log.debug("initialize() called");
    // Validate that configuration can be created (this checks env vars)
    createDatadogConfiguration({
      service: "logs",
      unstableOperations: ["v2.aggregateLogs"],
    });
    initialized = true;
  },

  execute: async (params: AggregateLogsParams) => {
    if (!initialized) {
      throw new Error("aggregateLogs not initialized. Call initialize() first.");
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

      const data = await datadogRequest<LogsAggregateResponse>({
        service: "logs",
        path: "/api/v2/logs/analytics/aggregate",
        method: "POST",
        body,
      });

      log.info({ bucketCount: data.data?.buckets?.length || 0 }, "aggregate-logs completed");
      return data;
    } catch (error: unknown) {
      log.error({ query: params.filter?.query, error }, "aggregate-logs failed");
      handleApiError(error, "aggregating logs");
    }
  },
};

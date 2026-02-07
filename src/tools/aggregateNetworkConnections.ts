import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("aggregate-network-connections");

interface AggregateNetworkConnectionsParams {
  filter_from?: string;
  filter_to?: string;
  filter_query?: string;
  group_by?: string[];
  aggregate?: string;
}

interface AggregateNetworkConnectionsResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      group_bys?: Record<string, string>;
      bytes_sent?: number;
      bytes_received?: number;
      connections?: number;
    };
  }>;
  meta?: Record<string, unknown>;
}

let initialized = false;

export const aggregateNetworkConnections = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: AggregateNetworkConnectionsParams) => {
    if (!initialized) {
      throw new Error("aggregateNetworkConnections not initialized. Call initialize() first.");
    }
    try {
      const body: Record<string, unknown> = {};
      const filter: Record<string, unknown> = {};
      if (params.filter_from !== undefined) filter.from = params.filter_from;
      if (params.filter_to !== undefined) filter.to = params.filter_to;
      if (params.filter_query !== undefined) filter.query = params.filter_query;
      if (Object.keys(filter).length > 0) body.filter = filter;
      if (params.group_by !== undefined) body.group_by = params.group_by;
      if (params.aggregate !== undefined) body.aggregate = params.aggregate;
      log.debug({ query: params.filter_query }, "Aggregating network connections");
      const response = await datadogRequest<AggregateNetworkConnectionsResponse>({
        service: "default",
        path: "/api/v2/network/analytics/aggregate/connections",
        method: "POST",
        body,
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved network aggregation");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "aggregate-network-connections failed");
      handleApiError(error, "Failed to aggregate network connections");
    }
  },
};

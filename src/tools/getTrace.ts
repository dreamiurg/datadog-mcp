import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";
import type { SpansSearchResponse } from "../lib/types.js";

const log = createToolLogger("get-trace");

interface GetTraceParams {
  traceId: string;
  from?: string;
  to?: string;
}

let initialized = false;

export const getTrace = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({
      service: "apm",
    });
    initialized = true;
  },

  execute: async (params: GetTraceParams) => {
    if (!initialized) {
      throw new Error("getTrace not initialized. Call initialize() first.");
    }

    try {
      const { traceId, from, to } = params;

      // Validate traceId format (16-32 hex chars for 64-bit or 128-bit trace IDs)
      if (!/^[0-9a-fA-F]{16,32}$/.test(traceId)) {
        throw new Error("Invalid trace ID format: must be 16-32 hexadecimal characters");
      }

      log.debug({ traceId, from, to }, "execute() called");

      // Use the spans search endpoint with a trace_id filter
      const body = {
        filter: {
          query: `trace_id:${traceId}`,
          from: from || "now-1h",
          to: to || "now",
        },
        sort: "timestamp",
        page: {
          limit: 1000, // Get all spans in the trace
        },
      };

      const data = await datadogRequest<SpansSearchResponse>({
        service: "apm",
        path: "/api/v2/spans/events/search",
        method: "POST",
        body,
      });

      log.info({ spanCount: data.data?.length || 0, traceId }, "get-trace completed");
      return data;
    } catch (error: unknown) {
      log.error({ traceId: params.traceId, error }, "get-trace failed");
      handleApiError(error, "getting trace");
    }
  },
};

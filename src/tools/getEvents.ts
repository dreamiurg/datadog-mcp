import { v1 } from "@datadog/datadog-api-client";
import { createDatadogConfiguration, createToolLogger, handleApiError } from "../lib/index.js";

const log = createToolLogger("get-events");

interface GetEventsParams {
  start: number;
  end: number;
  priority?: "normal" | "low";
  sources?: string;
  tags?: string;
  unaggregated?: boolean;
  excludeAggregation?: boolean;
  limit?: number;
}

let apiInstance: v1.EventsApi | null = null;

export const getEvents = {
  initialize: () => {
    log.debug("initialize() called");
    const configuration = createDatadogConfiguration({ service: "default" });
    apiInstance = new v1.EventsApi(configuration);
  },

  execute: async (params: GetEventsParams) => {
    if (!apiInstance) {
      throw new Error("getEvents not initialized. Call initialize() first.");
    }

    try {
      const { start, end, priority, sources, tags, unaggregated, excludeAggregation, limit } =
        params;

      log.debug({ start, end, priority }, "execute() called");
      const apiParams: v1.EventsApiListEventsRequest = {
        start,
        end,
        priority,
        sources,
        tags,
        unaggregated,
        excludeAggregate: excludeAggregation,
      };

      const response = await apiInstance.listEvents(apiParams);

      if (limit && response.events && response.events.length > limit) {
        response.events = response.events.slice(0, limit);
      }

      log.info({ eventCount: response.events?.length || 0 }, "get-events completed");
      return response;
    } catch (error: unknown) {
      log.error({ start: params.start, end: params.end, error }, "get-events failed");
      handleApiError(error, "fetching events");
    }
  },
};

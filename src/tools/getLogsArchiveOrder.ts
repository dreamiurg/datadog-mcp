import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-logs-archive-order");

type GetLogsArchiveOrderParams = Record<string, never>;

interface GetLogsArchiveOrderResponse {
  data?: {
    type?: string;
    attributes?: {
      archive_ids?: string[];
    };
  };
}

let initialized = false;

export const getLogsArchiveOrder = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: GetLogsArchiveOrderParams) => {
    if (!initialized) {
      throw new Error("getLogsArchiveOrder not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching logs archive order");
      const response = await datadogRequest<GetLogsArchiveOrderResponse>({
        service: "default",
        path: "/api/v2/logs/config/archive-order",
        method: "GET",
      });
      log.debug("Retrieved logs archive order");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-logs-archive-order failed");
      handleApiError(error, "Failed to get logs archive order");
    }
  },
};

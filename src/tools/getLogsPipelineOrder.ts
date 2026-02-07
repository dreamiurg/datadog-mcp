import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-logs-pipeline-order");

type GetLogsPipelineOrderParams = Record<string, never>;

interface GetLogsPipelineOrderResponse {
  pipeline_ids?: string[];
}

let initialized = false;

export const getLogsPipelineOrder = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: GetLogsPipelineOrderParams) => {
    if (!initialized) {
      throw new Error("getLogsPipelineOrder not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching logs pipeline order");
      const response = await datadogRequest<GetLogsPipelineOrderResponse>({
        service: "default",
        path: "/api/v1/logs/config/pipeline-order",
        method: "GET",
      });
      log.debug({ count: response.pipeline_ids?.length ?? 0 }, "Retrieved logs pipeline order");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-logs-pipeline-order failed");
      handleApiError(error, "Failed to get logs pipeline order");
    }
  },
};

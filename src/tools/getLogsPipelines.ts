import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-logs-pipelines");

type GetLogsPipelinesParams = Record<string, never>;

interface LogsPipeline {
  id?: string;
  name?: string;
  is_enabled?: boolean;
  filter?: {
    query?: string;
  };
  type?: string;
  order?: number;
  processors?: Array<{
    type?: string;
    name?: string;
    is_enabled?: boolean;
  }>;
}

let initialized = false;

export const getLogsPipelines = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: GetLogsPipelinesParams) => {
    if (!initialized) {
      throw new Error("getLogsPipelines not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching logs pipelines");
      const response = await datadogRequest<LogsPipeline[]>({
        service: "default",
        path: "/api/v1/logs/config/pipelines",
        method: "GET",
      });
      log.debug({ count: response.length }, "Retrieved logs pipelines");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-logs-pipelines failed");
      handleApiError(error, "Failed to get logs pipelines");
    }
  },
};

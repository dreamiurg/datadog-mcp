import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-log-pipelines");

type GetLogPipelinesParams = {};

type GetLogPipelinesResponse = Array<{
  id?: string;
  name?: string;
  type?: string;
  is_enabled?: boolean;
  filter?: { query?: string };
  processors?: Array<Record<string, unknown>>;
  is_read_only?: boolean;
}>;

let initialized = false;

export const getLogPipelines = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "logs" });
    initialized = true;
  },

  execute: async (_params: GetLogPipelinesParams) => {
    if (!initialized) {
      throw new Error("getLogPipelines not initialized. Call initialize() first.");
    }
    try {
      log.debug({}, "execute() called");
      const data = await datadogRequest<GetLogPipelinesResponse>({
        service: "logs",
        path: "/api/v1/logs/config/pipelines",
        method: "GET",
      });
      log.info({ pipelineCount: data.length }, "get-log-pipelines completed");
      return data;
    } catch (error: unknown) {
      log.error({ error }, "get-log-pipelines failed");
      handleApiError(error, "Failed to retrieve log pipelines");
    }
  },
};

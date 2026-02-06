import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-logs-archives");

type GetLogsArchivesParams = Record<string, never>;

interface GetLogsArchivesResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      name?: string;
      query?: string;
      state?: string;
      destination?: {
        type?: string;
        container?: string;
        storage_account?: string;
        path?: string;
        bucket?: string;
        integration?: {
          client_email?: string;
          project_id?: string;
          tenant_id?: string;
        };
      };
    };
  }>;
}

let initialized = false;

export const getLogsArchives = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: GetLogsArchivesParams) => {
    if (!initialized) {
      throw new Error("getLogsArchives not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching logs archives");
      const response = await datadogRequest<GetLogsArchivesResponse>({
        service: "default",
        path: "/api/v2/logs/config/archives",
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved logs archives");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-logs-archives failed");
      handleApiError(error, "Failed to get logs archives");
    }
  },
};

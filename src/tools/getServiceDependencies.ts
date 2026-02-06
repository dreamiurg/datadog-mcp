import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-service-dependencies");

interface GetServiceDependenciesParams {
  env: string;
}

interface GetServiceDependenciesResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      service?: string;
      dependencies?: string[];
    };
  }>;
}

let initialized = false;

export const getServiceDependencies = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: GetServiceDependenciesParams) => {
    if (!initialized) {
      throw new Error("getServiceDependencies not initialized. Call initialize() first.");
    }
    try {
      const { env } = params;
      log.debug({ env }, "Fetching service dependencies");
      const path = `/api/v2/services/dependencies?env=${encodeURIComponent(env)}`;
      const response = await datadogRequest<GetServiceDependenciesResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved service dependencies");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-service-dependencies failed");
      handleApiError(error, "Failed to get service dependencies");
    }
  },
};

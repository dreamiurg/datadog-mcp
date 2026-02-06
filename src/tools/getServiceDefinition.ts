import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-service-definition");

interface GetServiceDefinitionParams {
  serviceName: string;
  schemaVersion?: string;
}

interface GetServiceDefinitionResponse {
  data?: {
    id?: string;
    type?: string;
    attributes?: {
      schema?: Record<string, unknown>;
      meta?: Record<string, unknown>;
    };
  };
}

let initialized = false;

export const getServiceDefinition = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: GetServiceDefinitionParams): Promise<GetServiceDefinitionResponse> => {
    if (!initialized) {
      throw new Error("getServiceDefinition not initialized. Call initialize() first.");
    }

    try {
      const queryParams = new URLSearchParams();

      if (params.schemaVersion !== undefined) {
        queryParams.append("schema_version", params.schemaVersion);
      }

      const queryString = queryParams.toString();
      const path = `/api/v2/services/definitions/${encodeURIComponent(params.serviceName)}${queryString ? `?${queryString}` : ""}`;

      log.debug({ path, params }, "Getting service definition");

      const response = await datadogRequest<GetServiceDefinitionResponse>({
        method: "GET",
        path,
        service: "default",
      });

      log.info({ serviceName: params.serviceName }, "Successfully retrieved service definition");

      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-service-definition failed");
      handleApiError(error, "Failed to get service definition from Datadog Service Catalog");
    }
  },
};

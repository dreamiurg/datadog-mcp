import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-service-definitions");

interface ListServiceDefinitionsParams {
  pageSize?: number;
  pageNumber?: number;
  schemaVersion?: string; // "v1", "v2", "v2.1", "v2.2"
}

interface ListServiceDefinitionsResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      schema?: Record<string, unknown>;
      meta?: Record<string, unknown>;
    };
  }>;
  meta?: {
    page?: Record<string, unknown>;
  };
}

let initialized = false;

export const listServiceDefinitions = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (
    params: ListServiceDefinitionsParams,
  ): Promise<ListServiceDefinitionsResponse> => {
    if (!initialized) {
      throw new Error("listServiceDefinitions not initialized. Call initialize() first.");
    }

    try {
      const queryParams = new URLSearchParams();

      if (params.pageSize !== undefined) {
        queryParams.append("page[size]", String(params.pageSize));
      }
      if (params.pageNumber !== undefined) {
        queryParams.append("page[number]", String(params.pageNumber));
      }
      if (params.schemaVersion !== undefined) {
        queryParams.append("schema_version", params.schemaVersion);
      }

      const queryString = queryParams.toString();
      const path = `/api/v2/services/definitions${queryString ? `?${queryString}` : ""}`;

      log.debug({ path, params }, "Listing service definitions");

      const response = await datadogRequest<ListServiceDefinitionsResponse>({
        method: "GET",
        path,
        service: "default",
      });

      log.info({ count: response.data?.length }, "Successfully listed service definitions");

      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-service-definitions failed");
      handleApiError(error, "Failed to list service definitions from Datadog Service Catalog");
    }
  },
};

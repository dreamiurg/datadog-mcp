import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-authn-mappings");

interface ListAuthNMappingsParams {
  pageSize?: number;
  pageNumber?: number;
  sort?: string;
  filterQuery?: string;
}

interface ListAuthNMappingsResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      role?: {
        id?: string;
        name?: string;
      };
      saml_assertion_attribute?: {
        attribute_key?: string;
        attribute_value?: string;
      };
    };
  }>;
  meta?: {
    page?: {
      total_count?: number;
    };
  };
}

let initialized = false;

export const listAuthNMappings = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListAuthNMappingsParams): Promise<ListAuthNMappingsResponse> => {
    if (!initialized) {
      throw new Error("listAuthNMappings not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.pageSize !== undefined) {
        queryParams.append("page[size]", String(params.pageSize));
      }
      if (params.pageNumber !== undefined) {
        queryParams.append("page[number]", String(params.pageNumber));
      }
      if (params.sort) {
        queryParams.append("sort", params.sort);
      }
      if (params.filterQuery) {
        queryParams.append("filter", params.filterQuery);
      }

      const path = `/api/v2/authn_mappings${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await datadogRequest<ListAuthNMappingsResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.info({ count: response.data?.length ?? 0 }, "Retrieved authentication mappings");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-authn-mappings failed");
      return handleApiError(error, "Failed to list authentication mappings");
    }
  },
};

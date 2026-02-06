import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-powerpacks");

interface GetPowerpacksParams {
  page_limit?: number;
  page_offset?: number;
}

interface GetPowerpacksResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      name?: string;
      description?: string;
      tags?: string[];
      template_variables?: Array<{
        name?: string;
        defaults?: string[];
      }>;
    };
  }>;
}

let initialized = false;

export const getPowerpacks = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: GetPowerpacksParams) => {
    if (!initialized) {
      throw new Error("getPowerpacks not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.page_limit !== undefined) {
        queryParams.append("page[limit]", params.page_limit.toString());
      }
      if (params.page_offset !== undefined) {
        queryParams.append("page[offset]", params.page_offset.toString());
      }
      const queryString = queryParams.toString();
      const path = queryString ? `/api/v2/powerpacks?${queryString}` : "/api/v2/powerpacks";
      log.debug({ path }, "Fetching powerpacks");
      const response = await datadogRequest<GetPowerpacksResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved powerpacks");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-powerpacks failed");
      handleApiError(error, "Failed to get powerpacks");
    }
  },
};

import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-slo-corrections");

interface GetSLOCorrectionsParams {
  offset?: number;
  limit?: number;
}

interface GetSLOCorrectionsResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      category?: string;
      description?: string;
      start?: number;
      end?: number;
      timezone?: string;
      slo_id?: string;
      created_at?: number;
      modified_at?: number;
    };
  }>;
  meta?: {
    page?: {
      total_count?: number;
    };
  };
}

let initialized = false;

export const getSLOCorrections = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: GetSLOCorrectionsParams) => {
    if (!initialized) {
      throw new Error("getSLOCorrections not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.offset !== undefined) {
        queryParams.append("offset", params.offset.toString());
      }
      if (params.limit !== undefined) {
        queryParams.append("limit", params.limit.toString());
      }
      const queryString = queryParams.toString();
      const path = queryString ? `/api/v1/slo/correction?${queryString}` : "/api/v1/slo/correction";
      log.debug({ path }, "Fetching SLO corrections");
      const response = await datadogRequest<GetSLOCorrectionsResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved SLO corrections");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-slo-corrections failed");
      handleApiError(error, "Failed to get SLO corrections");
    }
  },
};

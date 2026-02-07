import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-csm-coverage");

interface GetCSMCoverageParams {
  page_size?: number;
  page_cursor?: string;
}

interface GetCSMCoverageResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      account_id?: string;
      cloud_provider?: string;
      coverage?: {
        cspm?: boolean;
        cwpp?: boolean;
        identity_risks?: boolean;
      };
      org_id?: number;
    };
  }>;
  meta?: {
    page?: {
      cursor?: string;
    };
  };
}

let initialized = false;

export const getCSMCoverage = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: GetCSMCoverageParams) => {
    if (!initialized) {
      throw new Error("getCSMCoverage not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.page_size !== undefined) {
        queryParams.append("page[size]", params.page_size.toString());
      }
      if (params.page_cursor !== undefined) {
        queryParams.append("page[cursor]", params.page_cursor);
      }
      const queryString = queryParams.toString();
      const path = queryString
        ? `/api/v2/csm/cloud_accounts/coverage?${queryString}`
        : "/api/v2/csm/cloud_accounts/coverage";
      log.debug({ path }, "Fetching CSM coverage");
      const response = await datadogRequest<GetCSMCoverageResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved CSM coverage");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-csm-coverage failed");
      handleApiError(error, "Failed to get CSM coverage");
    }
  },
};

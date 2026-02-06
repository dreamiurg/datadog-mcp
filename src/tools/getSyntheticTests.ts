import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-synthetic-tests");

interface GetSyntheticTestsParams {
  pageSize?: number;
  pageNumber?: number;
  type?: string;
  locations?: string;
}

interface SyntheticTestsResponse {
  tests?: Array<{
    public_id?: string;
    name?: string;
    type?: string;
    status?: string;
    locations?: string[];
    tags?: string[];
    message?: string;
    monitor_id?: number;
  }>;
  meta?: { page?: { total_count?: number } };
}

let initialized = false;

export const getSyntheticTests = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },

  execute: async (params: GetSyntheticTestsParams) => {
    if (!initialized) {
      throw new Error("getSyntheticTests not initialized. Call initialize() first.");
    }
    try {
      const { pageSize, pageNumber, type, locations } = params;
      log.debug({ pageSize, pageNumber, type, locations }, "execute() called");

      let path = "/api/v1/synthetics/tests";
      const queryParams: string[] = [];

      if (pageSize !== undefined) {
        queryParams.push(`page_size=${encodeURIComponent(pageSize)}`);
      }
      if (pageNumber !== undefined) {
        queryParams.push(`page_number=${encodeURIComponent(pageNumber)}`);
      }
      if (type !== undefined) {
        queryParams.push(`type=${encodeURIComponent(type)}`);
      }
      if (locations !== undefined) {
        queryParams.push(`locations=${encodeURIComponent(locations)}`);
      }

      if (queryParams.length > 0) {
        path += `?${queryParams.join("&")}`;
      }

      const data = await datadogRequest<SyntheticTestsResponse>({
        service: "default",
        path,
        method: "GET",
      });

      log.info({ testCount: data.tests?.length || 0 }, "get-synthetic-tests completed");
      return data;
    } catch (error: unknown) {
      log.error({ params, error }, "get-synthetic-tests failed");
      handleApiError(error, "getting synthetic tests");
    }
  },
};

import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-hourly-usage");

interface GetHourlyUsageParams {
  filter_timestamp_start: string;
  filter_timestamp_end?: string;
  filter_product_families: string;
  page_limit?: number;
  page_next_record_id?: string;
}

interface GetHourlyUsageResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      product_family?: string;
      org_name?: string;
      timestamp?: string;
      measurements?: Array<{
        usage_type?: string;
        value?: number;
      }>;
    };
  }>;
  meta?: {
    pagination?: {
      next_record_id?: string;
    };
  };
}

let initialized = false;

export const getHourlyUsage = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: GetHourlyUsageParams) => {
    if (!initialized) {
      throw new Error("getHourlyUsage not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("filter[timestamp][start]", params.filter_timestamp_start);
      if (params.filter_timestamp_end !== undefined) {
        queryParams.append("filter[timestamp][end]", params.filter_timestamp_end);
      }
      queryParams.append("filter[product_families]", params.filter_product_families);
      if (params.page_limit !== undefined) {
        queryParams.append("page[limit]", params.page_limit.toString());
      }
      if (params.page_next_record_id !== undefined) {
        queryParams.append("page[next_record_id]", params.page_next_record_id);
      }
      const path = `/api/v2/usage/hourly_usage?${queryParams.toString()}`;
      log.debug({ path }, "Fetching hourly usage");
      const response = await datadogRequest<GetHourlyUsageResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved hourly usage");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-hourly-usage failed");
      handleApiError(error, "Failed to get hourly usage");
    }
  },
};

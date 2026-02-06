import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-usage");

interface GetUsageParams {
  startHr: string;
  endHr?: string;
  productFamilies?: string;
  pageLimit?: number;
  pageNextRecordId?: string;
}

interface UsageResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: Record<string, unknown>;
  }>;
  meta?: {
    pagination?: {
      next_record_id?: string;
    };
  };
}

let initialized = false;

export const getUsage = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },

  execute: async (params: GetUsageParams) => {
    if (!initialized) {
      throw new Error("getUsage not initialized. Call initialize() first.");
    }
    try {
      const { startHr, endHr, productFamilies, pageLimit, pageNextRecordId } = params;
      log.debug({ startHr, endHr, productFamilies }, "execute() called");
      let path = `/api/v2/usage/hourly_usage?filter[timestamp][start]=${encodeURIComponent(startHr)}`;
      if (endHr) {
        path += `&filter[timestamp][end]=${encodeURIComponent(endHr)}`;
      }
      if (productFamilies) {
        path += `&filter[product_families]=${encodeURIComponent(productFamilies)}`;
      }
      if (pageLimit !== undefined) {
        path += `&page[limit]=${pageLimit}`;
      }
      if (pageNextRecordId) {
        path += `&page[next_record_id]=${encodeURIComponent(pageNextRecordId)}`;
      }
      const data = await datadogRequest<UsageResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.info({ recordCount: data.data?.length || 0 }, "get-usage completed");
      return data;
    } catch (error: unknown) {
      log.error({ startHr: params.startHr, error }, "get-usage failed");
      handleApiError(error, "fetching usage");
    }
  },
};

import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-estimated-cost");

interface GetEstimatedCostParams {
  view?: string;
  start_month?: string;
  end_month?: string;
  start_date?: string;
  end_date?: string;
}

interface GetEstimatedCostResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      org_name?: string;
      date?: string;
      charges?: Array<{
        product_name?: string;
        charge_type?: string;
        cost?: number;
      }>;
      total_cost?: number;
    };
  }>;
}

let initialized = false;

export const getEstimatedCost = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: GetEstimatedCostParams) => {
    if (!initialized) {
      throw new Error("getEstimatedCost not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.view !== undefined) {
        queryParams.append("view", params.view);
      }
      if (params.start_month !== undefined) {
        queryParams.append("start_month", params.start_month);
      }
      if (params.end_month !== undefined) {
        queryParams.append("end_month", params.end_month);
      }
      if (params.start_date !== undefined) {
        queryParams.append("start_date", params.start_date);
      }
      if (params.end_date !== undefined) {
        queryParams.append("end_date", params.end_date);
      }
      const queryString = queryParams.toString();
      const path = queryString
        ? `/api/v2/usage/estimated_cost?${queryString}`
        : "/api/v2/usage/estimated_cost";
      log.debug({ path }, "Fetching estimated cost");
      const response = await datadogRequest<GetEstimatedCostResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved estimated cost");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-estimated-cost failed");
      handleApiError(error, "Failed to get estimated cost");
    }
  },
};

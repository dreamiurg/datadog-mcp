import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-cost-budgets");

interface ListCostBudgetsParams {
  page_size?: number;
  page_offset?: number;
}

interface ListCostBudgetsResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      name?: string;
      budget_type?: string;
      amount?: number;
      currency?: string;
      start_month?: string;
      end_month?: string;
      status?: string;
      alert_threshold?: number;
    };
  }>;
  meta?: {
    pagination?: {
      total_count?: number;
    };
  };
}

let initialized = false;

export const listCostBudgets = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListCostBudgetsParams) => {
    if (!initialized) {
      throw new Error("listCostBudgets not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.page_size !== undefined) {
        queryParams.append("page[size]", params.page_size.toString());
      }
      if (params.page_offset !== undefined) {
        queryParams.append("page[offset]", params.page_offset.toString());
      }
      const queryString = queryParams.toString();
      const path = queryString ? `/api/v2/cost/budgets?${queryString}` : "/api/v2/cost/budgets";
      log.debug({ path }, "Fetching cost budgets");
      const response = await datadogRequest<ListCostBudgetsResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved cost budgets");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-cost-budgets failed");
      handleApiError(error, "Failed to list cost budgets");
    }
  },
};

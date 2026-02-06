import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-scorecard-outcomes");

interface ListScorecardOutcomesParams {
  page_size?: number;
  page_offset?: number;
  filter_rule_id?: string;
  filter_service_name?: string;
}

interface ListScorecardOutcomesResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      rule_id?: string;
      service_name?: string;
      state?: string;
      remarks?: string;
      created_at?: string;
      modified_at?: string;
    };
  }>;
}

let initialized = false;

export const listScorecardOutcomes = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListScorecardOutcomesParams) => {
    if (!initialized) {
      throw new Error("listScorecardOutcomes not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.page_size !== undefined) {
        queryParams.append("page[size]", params.page_size.toString());
      }
      if (params.page_offset !== undefined) {
        queryParams.append("page[offset]", params.page_offset.toString());
      }
      if (params.filter_rule_id !== undefined) {
        queryParams.append("filter[rule][id]", params.filter_rule_id);
      }
      if (params.filter_service_name !== undefined) {
        queryParams.append("filter[service_name]", params.filter_service_name);
      }
      const queryString = queryParams.toString();
      const path = queryString
        ? `/api/v2/scorecard/outcomes?${queryString}`
        : "/api/v2/scorecard/outcomes";
      log.debug({ path }, "Fetching scorecard outcomes");
      const response = await datadogRequest<ListScorecardOutcomesResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved scorecard outcomes");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-scorecard-outcomes failed");
      handleApiError(error, "Failed to list scorecard outcomes");
    }
  },
};

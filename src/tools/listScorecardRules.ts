import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-scorecard-rules");

interface ListScorecardRulesParams {
  page_size?: number;
  page_offset?: number;
  filter_rule_id?: string;
  filter_rule_name?: string;
}

interface ListScorecardRulesResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      name?: string;
      description?: string;
      enabled?: boolean;
      category?: string;
      owner?: string;
      created_at?: string;
      modified_at?: string;
    };
  }>;
}

let initialized = false;

export const listScorecardRules = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListScorecardRulesParams) => {
    if (!initialized) {
      throw new Error("listScorecardRules not initialized. Call initialize() first.");
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
      if (params.filter_rule_name !== undefined) {
        queryParams.append("filter[rule][name]", params.filter_rule_name);
      }
      const queryString = queryParams.toString();
      const path = queryString
        ? `/api/v2/scorecard/rules?${queryString}`
        : "/api/v2/scorecard/rules";
      log.debug({ path }, "Fetching scorecard rules");
      const response = await datadogRequest<ListScorecardRulesResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved scorecard rules");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-scorecard-rules failed");
      handleApiError(error, "Failed to list scorecard rules");
    }
  },
};

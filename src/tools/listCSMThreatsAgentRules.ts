import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-csm-threats-agent-rules");

interface ListCSMThreatsAgentRulesParams {
  page_size?: number;
  page_number?: number;
}

interface ListCSMThreatsAgentRulesResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      name?: string;
      description?: string;
      enabled?: boolean;
      expression?: string;
      agent_constraint?: {
        min_agent_version?: string;
      };
      created_at?: string;
      updated_at?: string;
    };
  }>;
  meta?: {
    page?: {
      total_count?: number;
    };
  };
}

let initialized = false;

export const listCSMThreatsAgentRules = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListCSMThreatsAgentRulesParams) => {
    if (!initialized) {
      throw new Error("listCSMThreatsAgentRules not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.page_size !== undefined) {
        queryParams.append("page[size]", params.page_size.toString());
      }
      if (params.page_number !== undefined) {
        queryParams.append("page[number]", params.page_number.toString());
      }
      const queryString = queryParams.toString();
      const path = queryString
        ? `/api/v2/csm/threats/agent_rules?${queryString}`
        : "/api/v2/csm/threats/agent_rules";
      log.debug({ path }, "Fetching CSM threats agent rules");
      const response = await datadogRequest<ListCSMThreatsAgentRulesResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved CSM threats agent rules");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-csm-threats-agent-rules failed");
      handleApiError(error, "Failed to list CSM threats agent rules");
    }
  },
};

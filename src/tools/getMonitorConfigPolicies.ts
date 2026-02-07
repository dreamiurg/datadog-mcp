import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-monitor-config-policies");

type GetMonitorConfigPoliciesParams = Record<string, never>;

interface GetMonitorConfigPoliciesResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      policy_type?: string;
      policy?: {
        tag_key?: string;
        tag_key_required?: boolean;
        valid_tag_values?: string[];
      };
      created_at?: number;
      modified_at?: number;
    };
  }>;
}

let initialized = false;

export const getMonitorConfigPolicies = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: GetMonitorConfigPoliciesParams) => {
    if (!initialized) {
      throw new Error("getMonitorConfigPolicies not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching monitor config policies");
      const response = await datadogRequest<GetMonitorConfigPoliciesResponse>({
        service: "default",
        path: "/api/v2/monitor/policy",
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved monitor config policies");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-monitor-config-policies failed");
      handleApiError(error, "Failed to get monitor config policies");
    }
  },
};

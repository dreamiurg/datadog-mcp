import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-security-rules");

interface ListSecurityRulesParams {
  page_size?: number;
  page_number?: number;
}

interface ListSecurityRulesResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      name?: string;
      message?: string;
      is_enabled?: boolean;
      has_extended_title?: boolean;
      creation_author_id?: number;
      tags?: string[];
      cases?: Array<{
        name?: string;
        status?: string;
        condition?: string;
      }>;
    };
  }>;
  meta?: {
    page?: {
      total_count?: number;
      total_filtered_count?: number;
    };
  };
}

let initialized = false;

export const listSecurityRules = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListSecurityRulesParams) => {
    if (!initialized) {
      throw new Error("listSecurityRules not initialized. Call initialize() first.");
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
        ? `/api/v2/security_monitoring/rules?${queryString}`
        : "/api/v2/security_monitoring/rules";
      log.debug({ path }, "Fetching security rules");
      const response = await datadogRequest<ListSecurityRulesResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved security rules");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-security-rules failed");
      handleApiError(error, "Failed to list security rules");
    }
  },
};

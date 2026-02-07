import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-vulnerabilities");

interface ListVulnerabilitiesParams {
  page_size?: number;
  page_cursor?: string;
  filter_type?: string;
  filter_severity?: string;
  filter_status?: string;
}

interface ListVulnerabilitiesResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      title?: string;
      severity?: string;
      status?: string;
      type?: string;
      cvss_score?: number;
      cve_id?: string;
      first_detected?: string;
      last_detected?: string;
      resource_type?: string;
      resource_id?: string;
    };
  }>;
  meta?: {
    page?: {
      cursor?: string;
      total_count?: number;
    };
  };
}

let initialized = false;

export const listVulnerabilities = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListVulnerabilitiesParams) => {
    if (!initialized) {
      throw new Error("listVulnerabilities not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.page_size !== undefined) {
        queryParams.append("page[size]", params.page_size.toString());
      }
      if (params.page_cursor !== undefined) {
        queryParams.append("page[cursor]", params.page_cursor);
      }
      if (params.filter_type !== undefined) {
        queryParams.append("filter[type]", params.filter_type);
      }
      if (params.filter_severity !== undefined) {
        queryParams.append("filter[severity]", params.filter_severity);
      }
      if (params.filter_status !== undefined) {
        queryParams.append("filter[status]", params.filter_status);
      }
      const queryString = queryParams.toString();
      const path = queryString
        ? `/api/v2/security/vulnerabilities/findings?${queryString}`
        : "/api/v2/security/vulnerabilities/findings";
      log.debug({ path }, "Fetching vulnerabilities");
      const response = await datadogRequest<ListVulnerabilitiesResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved vulnerabilities");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-vulnerabilities failed");
      handleApiError(error, "Failed to list vulnerabilities");
    }
  },
};

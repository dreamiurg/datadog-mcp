import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-vulnerabilities");

export interface ListVulnerabilitiesParams {
  page_token?: string;
  page_number?: number;
  filter_type?: string;
  filter_tool?: string;
  filter_status?: string;
  filter_cvss_base_severity?: string;
  filter_cvss_datadog_severity?: string;
  filter_language?: string;
  filter_ecosystem?: string;
  filter_code_location_file_path?: string;
  filter_fix_available?: boolean;
  filter_asset_name?: string;
  filter_asset_type?: string;
  filter_asset_environments?: string;
  filter_asset_repository_url?: string;
  filter_asset_risks_in_production?: boolean;
  filter_asset_risks_under_attack?: boolean;
}

interface ListVulnerabilitiesResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: Record<string, unknown>;
  }>;
  links?: {
    self?: string;
    first?: string;
    last?: string;
    next?: string;
  };
}

const FILTER_PARAMS: Array<{
  param: keyof ListVulnerabilitiesParams;
  query: string;
}> = [
  { param: "filter_type", query: "filter[type]" },
  { param: "filter_tool", query: "filter[tool]" },
  { param: "filter_status", query: "filter[status]" },
  { param: "filter_cvss_base_severity", query: "filter[cvss][base][severity]" },
  { param: "filter_cvss_datadog_severity", query: "filter[cvss][datadog][severity]" },
  { param: "filter_language", query: "filter[language]" },
  { param: "filter_ecosystem", query: "filter[ecosystem]" },
  { param: "filter_code_location_file_path", query: "filter[code_location][file_path]" },
  { param: "filter_fix_available", query: "filter[fix_available]" },
  { param: "filter_asset_name", query: "filter[asset][name]" },
  { param: "filter_asset_type", query: "filter[asset][type]" },
  { param: "filter_asset_environments", query: "filter[asset][environments]" },
  { param: "filter_asset_repository_url", query: "filter[asset][repository_url]" },
  { param: "filter_asset_risks_in_production", query: "filter[asset][risks][in_production]" },
  { param: "filter_asset_risks_under_attack", query: "filter[asset][risks][under_attack]" },
];

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
      if (params.page_token !== undefined) {
        queryParams.append("page[token]", params.page_token);
      }
      if (params.page_number !== undefined) {
        queryParams.append("page[number]", params.page_number.toString());
      }
      for (const { param, query } of FILTER_PARAMS) {
        const value = params[param];
        if (value !== undefined) {
          queryParams.append(query, String(value));
        }
      }
      const queryString = queryParams.toString();
      const path = queryString
        ? `/api/v2/security/vulnerabilities?${queryString}`
        : "/api/v2/security/vulnerabilities";
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
      handleApiError(error, "listing vulnerabilities");
    }
  },
};

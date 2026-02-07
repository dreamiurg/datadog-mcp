import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-ip-ranges");

type GetIPRangesParams = Record<string, never>;

interface GetIPRangesResponse {
  agents?: { prefixes_ipv4?: string[]; prefixes_ipv6?: string[] };
  api?: { prefixes_ipv4?: string[]; prefixes_ipv6?: string[] };
  apm?: { prefixes_ipv4?: string[]; prefixes_ipv6?: string[] };
  logs?: { prefixes_ipv4?: string[]; prefixes_ipv6?: string[] };
  process?: { prefixes_ipv4?: string[]; prefixes_ipv6?: string[] };
  synthetics?: { prefixes_ipv4?: string[]; prefixes_ipv6?: string[] };
  webhooks?: { prefixes_ipv4?: string[]; prefixes_ipv6?: string[] };
  modified?: string;
}

let initialized = false;

export const getIPRanges = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: GetIPRangesParams) => {
    if (!initialized) {
      throw new Error("getIPRanges not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching IP ranges");
      const response = await datadogRequest<GetIPRangesResponse>({
        service: "default",
        path: "/api/v1/ip_ranges",
        method: "GET",
      });
      log.debug("Retrieved IP ranges");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-ip-ranges failed");
      handleApiError(error, "Failed to get IP ranges");
    }
  },
};

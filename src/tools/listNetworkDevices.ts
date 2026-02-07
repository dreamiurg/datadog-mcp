import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-network-devices");

interface ListNetworkDevicesParams {
  page_size?: number;
  page_number?: number;
  filter_tag?: string;
  sort?: string;
}

interface ListNetworkDevicesResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      name?: string;
      ip_address?: string;
      status?: string;
      model?: string;
      vendor?: string;
      location?: string;
      tags?: string[];
    };
  }>;
  meta?: {
    page?: {
      total_count?: number;
    };
  };
}

let initialized = false;

export const listNetworkDevices = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListNetworkDevicesParams) => {
    if (!initialized) {
      throw new Error("listNetworkDevices not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.page_size !== undefined) {
        queryParams.append("page[size]", params.page_size.toString());
      }
      if (params.page_number !== undefined) {
        queryParams.append("page[number]", params.page_number.toString());
      }
      if (params.filter_tag !== undefined) {
        queryParams.append("filter[tag]", params.filter_tag);
      }
      if (params.sort !== undefined) {
        queryParams.append("sort", params.sort);
      }
      const queryString = queryParams.toString();
      const path = queryString
        ? `/api/v2/network/devices?${queryString}`
        : "/api/v2/network/devices";
      log.debug({ path }, "Fetching network devices");
      const response = await datadogRequest<ListNetworkDevicesResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved network devices");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-network-devices failed");
      handleApiError(error, "Failed to list network devices");
    }
  },
};

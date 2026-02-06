import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-active-hosts-count");

interface GetActiveHostsCountParams {
  from?: number;
}

interface GetActiveHostsCountResponse {
  total_active?: number;
  total_up?: number;
}

let initialized = false;

export const getActiveHostsCount = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },

  execute: async (params: GetActiveHostsCountParams) => {
    if (!initialized) {
      throw new Error("getActiveHostsCount not initialized. Call initialize() first.");
    }
    try {
      const { from } = params;
      log.debug({ from }, "execute() called");
      const queryParams = new URLSearchParams();
      if (from !== undefined) {
        queryParams.append("from", from.toString());
      }
      const queryString = queryParams.toString();
      const path = queryString ? `/api/v1/hosts/totals?${queryString}` : "/api/v1/hosts/totals";
      const data = await datadogRequest<GetActiveHostsCountResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.info(
        { total_active: data.total_active, total_up: data.total_up },
        "get-active-hosts-count completed",
      );
      return data;
    } catch (error: unknown) {
      log.error({ error }, "get-active-hosts-count failed");
      handleApiError(error, "getting active hosts count");
    }
  },
};

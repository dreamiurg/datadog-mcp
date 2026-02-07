import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-fleet-agents");

interface ListFleetAgentsParams {
  page_size?: number;
  page_cursor?: string;
  filter_query?: string;
}

interface ListFleetAgentsResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      hostname?: string;
      agent_version?: string;
      os?: string;
      platform?: string;
      status?: string;
      last_seen?: string;
      tags?: string[];
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

export const listFleetAgents = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListFleetAgentsParams) => {
    if (!initialized) {
      throw new Error("listFleetAgents not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.page_size !== undefined) {
        queryParams.append("page[size]", params.page_size.toString());
      }
      if (params.page_cursor !== undefined) {
        queryParams.append("page[cursor]", params.page_cursor);
      }
      if (params.filter_query !== undefined) {
        queryParams.append("filter[query]", params.filter_query);
      }
      const queryString = queryParams.toString();
      const path = queryString ? `/api/v2/fleet/agents?${queryString}` : "/api/v2/fleet/agents";
      log.debug({ path }, "Fetching fleet agents");
      const response = await datadogRequest<ListFleetAgentsResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved fleet agents");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-fleet-agents failed");
      handleApiError(error, "Failed to list fleet agents");
    }
  },
};

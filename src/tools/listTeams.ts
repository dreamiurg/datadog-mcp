import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-teams");

interface ListTeamsParams {
  pageNumber?: number;
  pageSize?: number;
  sort?: string; // "name", "-name", "user_count", "-user_count"
  filterKeyword?: string;
}

interface ListTeamsResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      name?: string;
      handle?: string;
      summary?: string;
      description?: string;
      user_count?: number;
      link_count?: number;
    };
  }>;
  meta?: {
    pagination?: Record<string, unknown>;
  };
}

let initialized = false;

export const listTeams = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListTeamsParams): Promise<ListTeamsResponse> => {
    if (!initialized) {
      throw new Error("listTeams not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.pageNumber !== undefined) {
        queryParams.append("page[number]", String(params.pageNumber));
      }
      if (params.pageSize !== undefined) {
        queryParams.append("page[size]", String(params.pageSize));
      }
      if (params.sort !== undefined) {
        queryParams.append("sort", params.sort);
      }
      if (params.filterKeyword !== undefined) {
        queryParams.append("filter[keyword]", params.filterKeyword);
      }

      const queryString = queryParams.toString();
      const path = queryString ? `/api/v2/team?${queryString}` : "/api/v2/team";

      log.debug({ path }, "Fetching teams");
      const response = await datadogRequest<ListTeamsResponse>({
        service: "default",
        path,
        method: "GET",
      });

      log.info({ teamCount: response.data?.length ?? 0 }, "Successfully retrieved teams");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-teams failed");
      return handleApiError(error, "Failed to list teams");
    }
  },
};

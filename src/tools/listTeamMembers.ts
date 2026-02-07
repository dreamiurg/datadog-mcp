import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-team-members");

interface ListTeamMembersParams {
  teamId: string;
  pageSize?: number;
  pageNumber?: number;
  sort?: string;
  filterKeyword?: string;
}

interface ListTeamMembersResponse {
  data?: unknown[];
  meta?: {
    pagination?: {
      first_offset?: number;
      last_offset?: number;
      limit?: number;
      next_offset?: number;
      offset?: number;
      prev_offset?: number;
      total_count?: number;
      type?: string;
    };
  };
}

let initialized = false;

export const listTeamMembers = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListTeamMembersParams): Promise<ListTeamMembersResponse> => {
    if (!initialized) {
      throw new Error("listTeamMembers not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.pageSize) queryParams.append("page[size]", params.pageSize.toString());
      if (params.pageNumber !== undefined)
        queryParams.append("page[number]", params.pageNumber.toString());
      if (params.sort) queryParams.append("sort", params.sort);
      if (params.filterKeyword) queryParams.append("filter[keyword]", params.filterKeyword);

      const encodedTeamId = encodeURIComponent(params.teamId);
      const path = `/api/v2/team/${encodedTeamId}/members${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await datadogRequest<ListTeamMembersResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.info({ count: response.data?.length ?? 0 }, "Listed team members");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-team-members failed");
      return handleApiError(error, "Failed to list team members");
    }
  },
};

import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-processes");

interface ListProcessesParams {
  search?: string;
  tags?: string;
  from?: number;
  to?: number;
  pageLimit?: number;
  pageCursor?: string;
}

interface ListProcessesResponse {
  data?: Array<{ id?: string; type?: string; attributes?: Record<string, unknown> }>;
  meta?: { page?: { after?: string; size?: number } };
}

let initialized = false;

export const listProcesses = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },

  execute: async (params: ListProcessesParams) => {
    if (!initialized) {
      throw new Error("listProcesses not initialized. Call initialize() first.");
    }
    try {
      const { search, tags, from, to, pageLimit, pageCursor } = params;
      log.debug({ search, tags, from, to, pageLimit, pageCursor }, "execute() called");
      const queryParams = new URLSearchParams();
      if (search !== undefined) {
        queryParams.append("search", search);
      }
      if (tags !== undefined) {
        queryParams.append("tags", tags);
      }
      if (from !== undefined) {
        queryParams.append("from", from.toString());
      }
      if (to !== undefined) {
        queryParams.append("to", to.toString());
      }
      if (pageLimit !== undefined) {
        queryParams.append("page[limit]", pageLimit.toString());
      }
      if (pageCursor !== undefined) {
        queryParams.append("page[cursor]", pageCursor);
      }
      const queryString = queryParams.toString();
      const path = queryString ? `/api/v2/processes?${queryString}` : "/api/v2/processes";
      const data = await datadogRequest<ListProcessesResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.info({ processCount: data.data?.length || 0 }, "list-processes completed");
      return data;
    } catch (error: unknown) {
      log.error({ error }, "list-processes failed");
      handleApiError(error, "listing processes");
    }
  },
};

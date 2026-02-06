import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-rum-applications");

type ListRumApplicationsParams = {};

interface RumApplicationsResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      name?: string;
      org_id?: number;
      type?: string;
      created_at?: string;
      created_by_handle?: string;
    };
  }>;
}

let initialized = false;

export const listRumApplications = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },

  execute: async (_params: ListRumApplicationsParams) => {
    if (!initialized) {
      throw new Error("listRumApplications not initialized. Call initialize() first.");
    }
    try {
      log.debug("execute() called");
      const data = await datadogRequest<RumApplicationsResponse>({
        service: "default",
        path: "/api/v2/rum/applications",
        method: "GET",
      });
      log.info({ appCount: data.data?.length || 0 }, "list-rum-applications completed");
      return data;
    } catch (error: unknown) {
      log.error({ error }, "list-rum-applications failed");
      handleApiError(error, "listing RUM applications");
    }
  },
};

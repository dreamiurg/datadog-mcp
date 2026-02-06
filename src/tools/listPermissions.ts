import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-permissions");

type ListPermissionsParams = Record<string, never>;

interface ListPermissionsResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      name?: string;
      display_name?: string;
      description?: string;
      created?: string;
      group_name?: string;
      display_type?: string;
      restricted?: boolean;
    };
  }>;
}

let initialized = false;

export const listPermissions = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: ListPermissionsParams) => {
    if (!initialized) {
      throw new Error("listPermissions not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching permissions");
      const response = await datadogRequest<ListPermissionsResponse>({
        service: "default",
        path: "/api/v2/permissions",
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved permissions");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-permissions failed");
      handleApiError(error, "Failed to list permissions");
    }
  },
};

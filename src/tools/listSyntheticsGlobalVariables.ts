import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-synthetics-global-variables");

type ListSyntheticsGlobalVariablesParams = Record<string, never>;

interface ListSyntheticsGlobalVariablesResponse {
  variables?: Array<{
    id?: string;
    name?: string;
    description?: string;
    tags?: string[];
    created_at?: string;
    modified_at?: string;
    parse_test_public_id?: string;
    is_totp?: boolean;
  }>;
}

let initialized = false;

export const listSyntheticsGlobalVariables = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: ListSyntheticsGlobalVariablesParams) => {
    if (!initialized) {
      throw new Error("listSyntheticsGlobalVariables not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching synthetics global variables");
      const response = await datadogRequest<ListSyntheticsGlobalVariablesResponse>({
        service: "default",
        path: "/api/v1/synthetics/variables",
        method: "GET",
      });
      log.debug(
        { count: response.variables?.length ?? 0 },
        "Retrieved synthetics global variables",
      );
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-synthetics-global-variables failed");
      handleApiError(error, "Failed to list synthetics global variables");
    }
  },
};

import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-synthetics-locations");

type ListSyntheticsLocationsParams = Record<string, never>;

interface ListSyntheticsLocationsResponse {
  locations?: Array<{
    id?: number;
    name?: string;
    region?: string;
    is_managed_by_user?: boolean;
    display_name?: string;
  }>;
}

let initialized = false;

export const listSyntheticsLocations = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (_params: ListSyntheticsLocationsParams) => {
    if (!initialized) {
      throw new Error("listSyntheticsLocations not initialized. Call initialize() first.");
    }
    try {
      log.debug("Fetching synthetics locations");
      const response = await datadogRequest<ListSyntheticsLocationsResponse>({
        service: "default",
        path: "/api/v1/synthetics/locations",
        method: "GET",
      });
      log.debug({ count: response.locations?.length ?? 0 }, "Retrieved synthetics locations");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-synthetics-locations failed");
      handleApiError(error, "Failed to list synthetics locations");
    }
  },
};

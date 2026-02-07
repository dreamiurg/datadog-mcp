import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-ci-test-events");

interface GetCITestEventsParams {
  filter?: {
    query?: string;
    from?: string;
    to?: string;
  };
  sort?: string;
  page?: {
    limit?: number;
    cursor?: string;
  };
}

interface GetCITestEventsResponse {
  data?: unknown[];
  meta?: {
    page?: {
      after?: string;
    };
  };
}

let initialized = false;

export const getCITestEvents = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: GetCITestEventsParams): Promise<GetCITestEventsResponse> => {
    if (!initialized) {
      throw new Error("getCITestEvents not initialized. Call initialize() first.");
    }
    try {
      const response = await datadogRequest<GetCITestEventsResponse>({
        service: "default",
        path: "/api/v2/ci/tests/events/search",
        method: "POST",
        body: params,
      });
      log.info({ count: response.data?.length ?? 0 }, "Searched CI test events");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-ci-test-events failed");
      return handleApiError(error, "Failed to search CI test events");
    }
  },
};

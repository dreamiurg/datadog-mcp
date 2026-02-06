import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("search-security-signals");

interface SearchSecuritySignalsParams {
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

interface SearchSecuritySignalsResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: Record<string, unknown>;
  }>;
  meta?: {
    page?: {
      after?: string;
    };
  };
  links?: {
    next?: string;
  };
}

let initialized = false;

export const searchSecuritySignals = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: SearchSecuritySignalsParams): Promise<SearchSecuritySignalsResponse> => {
    if (!initialized) {
      throw new Error("searchSecuritySignals not initialized. Call initialize() first.");
    }
    try {
      const path = "/api/v2/security_monitoring/signals/search";

      log.debug({ path, params }, "Searching security signals");
      const response = await datadogRequest<SearchSecuritySignalsResponse>({
        service: "default",
        path,
        method: "POST",
        body: params,
      });

      log.info(
        { signalCount: response.data?.length ?? 0 },
        "Successfully retrieved security signals",
      );
      return response;
    } catch (error: unknown) {
      log.error({ error }, "search-security-signals failed");
      return handleApiError(error, "Failed to search security signals");
    }
  },
};

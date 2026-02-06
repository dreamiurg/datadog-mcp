import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-slo-history");

interface GetSloHistoryParams {
  sloId: string;
  fromTs: number;
  toTs: number;
  target?: number;
}

interface SloHistoryResponse {
  data?: {
    thresholds?: Record<string, unknown>;
    from_ts?: number;
    to_ts?: number;
    type?: string;
    overall?: {
      sli_value?: number;
      span_precision?: number;
      name?: string;
    };
  };
  errors?: Array<{ error?: string }>;
}

let initialized = false;

export const getSloHistory = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },

  execute: async (params: GetSloHistoryParams) => {
    if (!initialized) {
      throw new Error("getSloHistory not initialized. Call initialize() first.");
    }
    try {
      const { sloId, fromTs, toTs, target } = params;
      log.debug({ sloId, fromTs, toTs }, "execute() called");
      let path = `/api/v1/slo/${encodeURIComponent(sloId)}/history?from_ts=${fromTs}&to_ts=${toTs}`;
      if (target !== undefined) {
        path += `&target=${target}`;
      }
      const data = await datadogRequest<SloHistoryResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.info({ sloId }, "get-slo-history completed");
      return data;
    } catch (error: unknown) {
      log.error({ sloId: params.sloId, error }, "get-slo-history failed");
      handleApiError(error, "fetching SLO history");
    }
  },
};

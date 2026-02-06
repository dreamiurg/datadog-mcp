import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-synthetic-results");

interface GetSyntheticResultsParams {
  publicId: string;
  fromTs?: number;
  toTs?: number;
  probeDc?: string[];
}

interface SyntheticResultsResponse {
  results?: Array<{
    result_id?: string;
    status?: number;
    check_time?: number;
    probe_dc?: string;
    result?: Record<string, unknown>;
  }>;
  last_timestamp_fetched?: number;
}

let initialized = false;

export const getSyntheticResults = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },

  execute: async (params: GetSyntheticResultsParams) => {
    if (!initialized) {
      throw new Error("getSyntheticResults not initialized. Call initialize() first.");
    }
    try {
      const { publicId, fromTs, toTs, probeDc } = params;
      log.debug({ publicId, fromTs, toTs, probeDc }, "execute() called");

      let path = `/api/v1/synthetics/tests/${encodeURIComponent(publicId)}/results`;
      const queryParams: string[] = [];

      if (fromTs !== undefined) {
        queryParams.push(`from_ts=${encodeURIComponent(fromTs)}`);
      }
      if (toTs !== undefined) {
        queryParams.push(`to_ts=${encodeURIComponent(toTs)}`);
      }
      if (probeDc !== undefined && probeDc.length > 0) {
        probeDc.forEach((dc) => {
          queryParams.push(`probe_dc=${encodeURIComponent(dc)}`);
        });
      }

      if (queryParams.length > 0) {
        path += `?${queryParams.join("&")}`;
      }

      const data = await datadogRequest<SyntheticResultsResponse>({
        service: "default",
        path,
        method: "GET",
      });

      log.info({ resultCount: data.results?.length || 0 }, "get-synthetic-results completed");
      return data;
    } catch (error: unknown) {
      log.error({ publicId: params.publicId, error }, "get-synthetic-results failed");
      handleApiError(error, "getting synthetic results");
    }
  },
};

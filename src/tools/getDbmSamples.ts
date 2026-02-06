import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("getDbmSamples");

interface GetDbmSamplesParams {
  start?: number;
  end?: number;
  source?: string;
  dbHost?: string;
  dbName?: string;
  limit?: number;
}

interface DbmSample {
  id?: string;
  type?: string;
  attributes?: {
    timestamp?: string;
    host?: string;
    db_name?: string;
    query_signature?: string;
    statement?: string;
    duration?: number;
    rows_affected?: number;
  };
}

interface GetDbmSamplesResponse {
  data?: DbmSample[];
  meta?: {
    page?: {
      after?: string;
    };
  };
}

let initialized = false;

function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&");
}

export const getDbmSamples = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },

  execute: async (params: GetDbmSamplesParams) => {
    if (!initialized) {
      throw new Error("getDbmSamples not initialized. Call initialize() first.");
    }
    try {
      log.debug(
        {
          start: params.start,
          end: params.end,
          source: params.source,
          dbHost: params.dbHost,
          dbName: params.dbName,
          limit: params.limit,
        },
        "execute() called",
      );

      const queryParams: Record<string, string | number | undefined> = {
        start: params.start,
        end: params.end,
        source: params.source,
        db_host: params.dbHost,
        db_name: params.dbName,
        limit: params.limit,
      };

      const queryString = buildQueryString(queryParams);
      const path = `/api/v2/dbm/samples${queryString}`;

      const data = await datadogRequest<GetDbmSamplesResponse>({
        service: "default",
        path,
        method: "GET",
      });

      log.info({ resultCount: data.data?.length || 0 }, "getDbmSamples completed");
      return data;
    } catch (error: unknown) {
      log.error({ error }, "getDbmSamples failed");
      handleApiError(error, "Failed to retrieve DBM samples");
    }
  },
};

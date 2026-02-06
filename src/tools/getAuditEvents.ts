import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("getAuditEvents");

interface GetAuditEventsParams {
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
  limit?: number;
}

interface AuditEvent {
  id?: string;
  type?: string;
  attributes?: {
    timestamp?: string;
    service?: string;
    type?: string;
    action?: string;
    user?: {
      handle?: string;
      name?: string;
    };
    resource_type?: string;
    resource_id?: string;
  };
}

interface GetAuditEventsResponse {
  data?: AuditEvent[];
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

export const getAuditEvents = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },

  execute: async (params: GetAuditEventsParams) => {
    if (!initialized) {
      throw new Error("getAuditEvents not initialized. Call initialize() first.");
    }
    try {
      log.debug(
        {
          query: params.filter?.query,
          from: params.filter?.from,
          to: params.filter?.to,
          sort: params.sort,
          limit: params.limit,
        },
        "execute() called",
      );

      const body: {
        filter?: GetAuditEventsParams["filter"];
        sort?: string;
        page?: GetAuditEventsParams["page"];
      } = {};

      if (params.filter) body.filter = params.filter;
      if (params.sort) body.sort = params.sort;
      if (params.page) body.page = params.page;

      const data = await datadogRequest<GetAuditEventsResponse>({
        service: "default",
        path: "/api/v2/audit/events/search",
        method: "POST",
        body,
      });

      // Apply client-side limit truncation
      if (params.limit && data.data && data.data.length > params.limit) {
        data.data = data.data.slice(0, params.limit);
      }

      log.info({ resultCount: data.data?.length || 0 }, "getAuditEvents completed");
      return data;
    } catch (error: unknown) {
      log.error({ error }, "getAuditEvents failed");
      handleApiError(error, "Failed to retrieve audit events");
    }
  },
};

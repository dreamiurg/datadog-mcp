import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-incident-timeline");

interface GetIncidentTimelineParams {
  incidentId: string;
  pageSize?: number;
  pageOffset?: number;
  filterType?: string;
}

interface GetIncidentTimelineResponse {
  data?: unknown[];
  meta?: {
    pagination?: {
      offset?: number;
      size?: number;
    };
  };
}

let initialized = false;

export const getIncidentTimeline = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: GetIncidentTimelineParams): Promise<GetIncidentTimelineResponse> => {
    if (!initialized) {
      throw new Error("getIncidentTimeline not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.pageSize) queryParams.append("page[size]", params.pageSize.toString());
      if (params.pageOffset !== undefined)
        queryParams.append("page[offset]", params.pageOffset.toString());
      if (params.filterType) queryParams.append("filter[type]", params.filterType);

      const encodedId = encodeURIComponent(params.incidentId);
      const path = `/api/v2/incidents/${encodedId}/timeline${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await datadogRequest<GetIncidentTimelineResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.info({ count: response.data?.length ?? 0 }, "Retrieved incident timeline");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-incident-timeline failed");
      return handleApiError(error, "Failed to get incident timeline");
    }
  },
};

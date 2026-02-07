import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-incident-todos");

interface GetIncidentTodosParams {
  incident_id: string;
}

interface GetIncidentTodosResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      content?: string;
      completed?: string;
      due_date?: string;
      assignees?: Array<{
        id?: string;
        type?: string;
      }>;
      created_at?: string;
      modified_at?: string;
    };
  }>;
}

let initialized = false;

export const getIncidentTodos = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: GetIncidentTodosParams) => {
    if (!initialized) {
      throw new Error("getIncidentTodos not initialized. Call initialize() first.");
    }
    try {
      const path = `/api/v2/incidents/${encodeURIComponent(params.incident_id)}/todos`;
      log.debug({ incident_id: params.incident_id }, "Fetching incident todos");
      const response = await datadogRequest<GetIncidentTodosResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved incident todos");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-incident-todos failed");
      handleApiError(error, "Failed to get incident todos");
    }
  },
};

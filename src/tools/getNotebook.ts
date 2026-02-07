import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("get-notebook");

interface GetNotebookParams {
  notebook_id: number;
}

interface GetNotebookResponse {
  data?: {
    id?: number;
    type?: string;
    attributes?: {
      name?: string;
      author?: { handle?: string; name?: string };
      cells?: Array<{
        id?: string;
        type?: string;
        attributes?: {
          definition?: Record<string, unknown>;
        };
      }>;
      status?: string;
      created?: string;
      modified?: string;
    };
  };
}

let initialized = false;

export const getNotebook = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: GetNotebookParams) => {
    if (!initialized) {
      throw new Error("getNotebook not initialized. Call initialize() first.");
    }
    try {
      const path = `/api/v1/notebooks/${params.notebook_id}`;
      log.debug({ notebook_id: params.notebook_id }, "Fetching notebook");
      const response = await datadogRequest<GetNotebookResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ name: response.data?.attributes?.name }, "Retrieved notebook");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "get-notebook failed");
      handleApiError(error, "Failed to get notebook");
    }
  },
};

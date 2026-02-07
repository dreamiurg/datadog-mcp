import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-workflow-executions");

interface ListWorkflowExecutionsParams {
  workflowId: string;
  pageSize?: number;
  pageNumber?: number;
}

interface ListWorkflowExecutionsResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      status?: string;
      start?: string;
      end?: string;
      trigger?: {
        id?: string;
        type?: string;
      };
    };
  }>;
  meta?: {
    page?: {
      total_count?: number;
    };
  };
}

let initialized = false;

export const listWorkflowExecutions = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (
    params: ListWorkflowExecutionsParams,
  ): Promise<ListWorkflowExecutionsResponse> => {
    if (!initialized) {
      throw new Error("listWorkflowExecutions not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.pageSize !== undefined) {
        queryParams.append("page[size]", String(params.pageSize));
      }
      if (params.pageNumber !== undefined) {
        queryParams.append("page[number]", String(params.pageNumber));
      }

      const path = `/api/v2/workflows/${encodeURIComponent(params.workflowId)}/instances${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await datadogRequest<ListWorkflowExecutionsResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.info({ count: response.data?.length ?? 0 }, "Retrieved workflow executions");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-workflow-executions failed");
      return handleApiError(error, "Failed to list workflow executions");
    }
  },
};

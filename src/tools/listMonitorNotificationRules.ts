import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-monitor-notification-rules");

interface ListMonitorNotificationRulesParams {
  page_size?: number;
  page_offset?: number;
}

interface ListMonitorNotificationRulesResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      name?: string;
      filter?: {
        tags?: string[];
      };
      recipients?: string[];
      created_at?: string;
      modified_at?: string;
    };
  }>;
  meta?: {
    page?: {
      total_count?: number;
    };
  };
}

let initialized = false;

export const listMonitorNotificationRules = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListMonitorNotificationRulesParams) => {
    if (!initialized) {
      throw new Error("listMonitorNotificationRules not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.page_size !== undefined) {
        queryParams.append("page[size]", params.page_size.toString());
      }
      if (params.page_offset !== undefined) {
        queryParams.append("page[offset]", params.page_offset.toString());
      }
      const queryString = queryParams.toString();
      const path = queryString
        ? `/api/v2/monitor/notification_rules?${queryString}`
        : "/api/v2/monitor/notification_rules";
      log.debug({ path }, "Fetching monitor notification rules");
      const response = await datadogRequest<ListMonitorNotificationRulesResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved monitor notification rules");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-monitor-notification-rules failed");
      handleApiError(error, "Failed to list monitor notification rules");
    }
  },
};

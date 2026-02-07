import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-downtime-schedules");

interface ListDowntimeSchedulesParams {
  page_limit?: number;
  page_offset?: number;
  current_only?: boolean;
}

interface ListDowntimeSchedulesResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      display_timezone?: string;
      message?: string;
      mute_first_recovery_notification?: boolean;
      scope?: string;
      status?: string;
      schedule?: {
        start?: string;
        end?: string;
        timezone?: string;
      };
      monitor_identifier?: {
        monitor_id?: number;
        monitor_tags?: string[];
      };
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

export const listDowntimeSchedules = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListDowntimeSchedulesParams) => {
    if (!initialized) {
      throw new Error("listDowntimeSchedules not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.page_limit !== undefined) {
        queryParams.append("page[limit]", params.page_limit.toString());
      }
      if (params.page_offset !== undefined) {
        queryParams.append("page[offset]", params.page_offset.toString());
      }
      if (params.current_only !== undefined) {
        queryParams.append("current_only", params.current_only.toString());
      }
      const queryString = queryParams.toString();
      const path = queryString ? `/api/v2/downtime?${queryString}` : "/api/v2/downtime";
      log.debug({ path }, "Fetching downtime schedules");
      const response = await datadogRequest<ListDowntimeSchedulesResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved downtime schedules");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-downtime-schedules failed");
      handleApiError(error, "Failed to list downtime schedules");
    }
  },
};

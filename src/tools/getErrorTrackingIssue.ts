import { createDatadogConfiguration, createToolLogger, datadogRequest, handleApiError } from "../lib/index.js";

const log = createToolLogger("get-error-tracking-issue");

interface GetErrorTrackingIssueParams {
    issue_id: string;
}

interface GetErrorTrackingIssueResponse {
    data?: {
        id?: string;
        type?: string;
        attributes?: {
            title?: string;
            status?: string;
            level?: string;
            first_seen?: string;
            last_seen?: string;
            count?: number;
            impacted_accounts?: number;
            error_type?: string;
            message?: string;
            service?: string;
            env?: string;
        };
    };
}

let initialized = false;

export const getErrorTrackingIssue = {
    initialize: () => {
        log.debug("initialize() called");
        createDatadogConfiguration({ service: "default" });
        initialized = true;
    },
    execute: async (params: GetErrorTrackingIssueParams) => {
        if (!initialized) {
            throw new Error("getErrorTrackingIssue not initialized. Call initialize() first.");
        }
        try {
            const path = `/api/v2/error-tracking/issues/${encodeURIComponent(params.issue_id)}`;
            log.debug({ issue_id: params.issue_id }, "Fetching error tracking issue");
            const response = await datadogRequest<GetErrorTrackingIssueResponse>({
                service: "default",
                path,
                method: "GET",
            });
            log.debug({ title: response.data?.attributes?.title }, "Retrieved error tracking issue");
            return response;
        } catch (error: unknown) {
            log.error({ error }, "get-error-tracking-issue failed");
            handleApiError(error, "Failed to get error tracking issue");
        }
    },
};

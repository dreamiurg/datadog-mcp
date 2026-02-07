import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";

const log = createToolLogger("list-aws-accounts");

interface ListAWSAccountsParams {
  aws_account_id?: string;
}

interface ListAWSAccountsResponse {
  data?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      aws_account_id?: string;
      account_tags?: string[];
      aws_partition?: string;
      auth_config?: Record<string, unknown>;
      aws_regions?: {
        include_all?: boolean;
        include_only?: string[];
      };
      metrics_config?: Record<string, unknown>;
      logs_config?: Record<string, unknown>;
      resources_config?: Record<string, unknown>;
      traces_config?: Record<string, unknown>;
    };
  }>;
}

let initialized = false;

export const listAWSAccounts = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({ service: "default" });
    initialized = true;
  },
  execute: async (params: ListAWSAccountsParams) => {
    if (!initialized) {
      throw new Error("listAWSAccounts not initialized. Call initialize() first.");
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.aws_account_id !== undefined) {
        queryParams.append("aws_account_id", params.aws_account_id);
      }
      const queryString = queryParams.toString();
      const path = queryString
        ? `/api/v2/integration/aws/accounts?${queryString}`
        : "/api/v2/integration/aws/accounts";
      log.debug({ path }, "Fetching AWS accounts");
      const response = await datadogRequest<ListAWSAccountsResponse>({
        service: "default",
        path,
        method: "GET",
      });
      log.debug({ count: response.data?.length ?? 0 }, "Retrieved AWS accounts");
      return response;
    } catch (error: unknown) {
      log.error({ error }, "list-aws-accounts failed");
      handleApiError(error, "Failed to list AWS accounts");
    }
  },
};

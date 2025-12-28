import { v1 } from "@datadog/datadog-api-client";
import { createDatadogConfiguration, createToolLogger, handleApiError } from "../lib/index.js";

interface GetSLOParams {
  sloId: string;
  withConfiguredAlertIds?: boolean;
}

const log = createToolLogger("get-slo");

let apiInstance: v1.ServiceLevelObjectivesApi | null = null;

export const getSLO = {
  initialize: () => {
    log.debug("initialize() called");
    const configuration = createDatadogConfiguration({ service: "default" });
    apiInstance = new v1.ServiceLevelObjectivesApi(configuration);
  },

  execute: async (params: GetSLOParams) => {
    if (!apiInstance) {
      throw new Error("getSLO not initialized. Call initialize() first.");
    }

    log.debug({ sloId: params.sloId }, "executing get-slo");

    try {
      const apiParams: v1.ServiceLevelObjectivesApiGetSLORequest = {
        sloId: params.sloId,
        withConfiguredAlertIds: params.withConfiguredAlertIds,
      };

      const response = await apiInstance.getSLO(apiParams);

      log.info({ sloId: params.sloId }, "get-slo completed");
      return response;
    } catch (error: unknown) {
      log.error({ sloId: params.sloId, error }, "get-slo failed");
      handleApiError(error, "fetching SLO");
    }
  },
};

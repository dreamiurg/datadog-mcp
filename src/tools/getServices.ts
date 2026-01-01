import {
  createDatadogConfiguration,
  createToolLogger,
  datadogRequest,
  handleApiError,
} from "../lib/index.js";
import type { ServicesResponse } from "../lib/types.js";

const log = createToolLogger("get-services");

interface GetServicesParams {
  env?: string;
}

let initialized = false;

export const getServices = {
  initialize: () => {
    log.debug("initialize() called");
    createDatadogConfiguration({
      service: "apm",
    });
    initialized = true;
  },

  execute: async (params: GetServicesParams) => {
    if (!initialized) {
      throw new Error("getServices not initialized. Call initialize() first.");
    }

    try {
      const { env } = params;

      log.debug({ env }, "execute() called");

      // Build query params
      const queryParams = new URLSearchParams();
      if (env) {
        queryParams.set("env", env);
      }

      const queryString = queryParams.toString();
      const path = `/api/v1/services${queryString ? `?${queryString}` : ""}`;

      const data = await datadogRequest<ServicesResponse>({
        service: "apm",
        path,
        method: "GET",
      });

      // Transform the nested object response into a flat array of service entries
      const services: Array<{ name: string; env: string }> = [];
      for (const [name, envs] of Object.entries(data)) {
        for (const env of Object.keys(envs as Record<string, unknown>)) {
          services.push({ name, env });
        }
      }

      log.info({ serviceCount: services.length }, "get-services completed");
      return { services };
    } catch (error: unknown) {
      log.error({ env: params.env, error }, "get-services failed");
      handleApiError(error, "getting services");
    }
  },
};

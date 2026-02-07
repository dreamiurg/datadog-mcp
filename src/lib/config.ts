import { client } from "@datadog/datadog-api-client";

/**
 * Supported Datadog service types that may use different regional endpoints
 */
export type DatadogService = "default" | "logs" | "metrics" | "apm";

/**
 * Configuration options for creating a Datadog API client configuration
 */
interface ConfigOptions {
  /**
   * The service type determines which site configuration to use
   */
  service?: DatadogService;
  /**
   * Unstable operations to enable
   */
  unstableOperations?: string[];
}

/**
 * Gets the appropriate site configuration for a given service
 */
function getSiteForService(service: DatadogService): string | undefined {
  switch (service) {
    case "logs":
      return process.env.DD_LOGS_SITE;
    case "metrics":
      return process.env.DD_METRICS_SITE;
    case "apm":
      return process.env.DD_APM_SITE;
    default:
      return process.env.DD_SITE;
  }
}

/**
 * Creates a Datadog API client configuration with proper authentication
 * and site configuration based on the service type.
 *
 * @param options - Configuration options
 * @returns A configured Datadog API client Configuration instance
 */
export function createDatadogConfiguration(options: ConfigOptions = {}): client.Configuration {
  const { service = "default", unstableOperations = [] } = options;

  const configuration = client.createConfiguration({
    authMethods: {
      apiKeyAuth: process.env.DD_API_KEY,
      appKeyAuth: process.env.DD_APP_KEY,
    },
  });

  const site = getSiteForService(service);
  if (site) {
    configuration.setServerVariables({ site });
  }

  // Enable any unstable operations
  for (const operation of unstableOperations) {
    configuration.unstableOperations[operation] = true;
  }

  return configuration;
}

/**
 * Returns the current Datadog credentials from environment variables.
 * Useful for tools that need direct API access.
 */
export function getCredentials(): { apiKey: string; appKey: string } {
  const apiKey = process.env.DD_API_KEY;
  const appKey = process.env.DD_APP_KEY;

  if (!apiKey || !appKey) {
    throw new Error("Datadog API Key and App Key are required");
  }

  return { apiKey, appKey };
}

/**
 * Returns the base URL for a given Datadog service.
 *
 * For the default service (and when no service-specific env var is set),
 * prepends "api." to match the official Datadog API endpoint format:
 * https://api.{site}/api/v1/... (e.g. https://api.datadoghq.com)
 *
 * When a service-specific env var (DD_LOGS_SITE, DD_METRICS_SITE, DD_APM_SITE)
 * is explicitly set, it is used as-is since the user provides the full hostname.
 */
export function getServiceBaseUrl(service: DatadogService): string {
  const serviceSite = getSiteForService(service);
  const baseSite = process.env.DD_SITE || "datadoghq.com";

  if (service !== "default" && serviceSite && serviceSite !== baseSite) {
    // Service-specific env var is explicitly set to a custom value — use as-is
    return `https://${serviceSite}`;
  }

  // Use base site with api. prefix (matching Datadog SDK behavior)
  const site = serviceSite || baseSite;
  return `https://api.${site}`;
}

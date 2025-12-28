"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDatadogConfiguration = createDatadogConfiguration;
exports.getCredentials = getCredentials;
exports.getServiceBaseUrl = getServiceBaseUrl;
const datadog_api_client_1 = require("@datadog/datadog-api-client");
/**
 * Gets the appropriate site configuration for a given service
 */
function getSiteForService(service) {
    switch (service) {
        case "logs":
            return process.env.DD_LOGS_SITE;
        case "metrics":
            return process.env.DD_METRICS_SITE;
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
function createDatadogConfiguration(options = {}) {
    const { service = "default", unstableOperations = [] } = options;
    const configuration = datadog_api_client_1.client.createConfiguration({
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
function getCredentials() {
    const apiKey = process.env.DD_API_KEY;
    const appKey = process.env.DD_APP_KEY;
    if (!apiKey || !appKey) {
        throw new Error("Datadog API Key and App Key are required");
    }
    return { apiKey, appKey };
}
/**
 * Returns the base URL for a given Datadog service.
 */
function getServiceBaseUrl(service) {
    const site = getSiteForService(service) || "datadoghq.com";
    return `https://${site}`;
}

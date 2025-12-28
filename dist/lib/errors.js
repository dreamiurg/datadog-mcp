"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatadogApiError = void 0;
exports.handleApiError = handleApiError;
const logger_js_1 = require("./logger.js");
/**
 * Maps operation contexts to their required Datadog Application Key scopes.
 * Used to provide helpful error messages when permission issues occur.
 */
const SCOPE_HINTS = {
    "fetching monitors": "monitors_read",
    "fetching monitor": "monitors_read",
    "fetching dashboards": "dashboards_read",
    "fetching dashboard": "dashboards_read",
    "fetching metrics": "metrics_read",
    "fetching metric metadata": "metrics_read",
    "fetching events": "events_read",
    "fetching incidents": "incident_read",
    "searching logs": "logs_read_data",
    "aggregating logs": "logs_read_data",
    "fetching hosts": "hosts_read",
    "fetching downtimes": "monitors_downtime",
    "fetching SLOs": "slos_read",
    "fetching SLO": "slos_read",
};
/**
 * Custom error class for Datadog API errors with status code information
 */
class DatadogApiError extends Error {
    constructor(message, statusCode, context) {
        super(message);
        this.statusCode = statusCode;
        this.context = context;
        this.name = "DatadogApiError";
    }
}
exports.DatadogApiError = DatadogApiError;
/**
 * Type guard to check if an error is a raw API error
 */
function isRawApiError(error) {
    if (typeof error !== "object" || error === null) {
        return false;
    }
    const err = error;
    return typeof err.status === "number" || typeof err.code === "number";
}
/**
 * Handles Datadog API errors consistently across all tools.
 * Provides specific error messages for common error codes and logs appropriately.
 *
 * @param error - The error caught from an API call
 * @param context - A description of what operation was being attempted
 * @throws DatadogApiError with appropriate message
 */
function handleApiError(error, context) {
    const statusCode = isRawApiError(error) ? (error.status ?? error.code) : undefined;
    if (statusCode === 403) {
        const requiredScope = SCOPE_HINTS[context];
        const scopeHint = requiredScope
            ? ` This operation requires the '${requiredScope}' scope on your Application Key.`
            : "";
        logger_js_1.logger.warn({ statusCode: 403, context, requiredScope }, `Authorization failed (403 Forbidden): Check that your API key and Application key are valid and have sufficient permissions.${scopeHint}`);
        throw new DatadogApiError(`Datadog API authorization failed while ${context}. Your Application Key may be missing required scope permissions.${scopeHint} Go to Datadog Organization Settings → Application Keys to add the required scope.`, 403, context);
    }
    if (statusCode === 404) {
        logger_js_1.logger.warn({ statusCode: 404, context }, "Resource not found (404)");
        throw new DatadogApiError("The requested resource was not found.", 404, context);
    }
    if (statusCode === 429) {
        logger_js_1.logger.warn({ statusCode: 429, context }, "Rate limit exceeded (429)");
        throw new DatadogApiError("Rate limit exceeded. Please wait before making more requests.", 429, context);
    }
    // Generic error handling
    if (statusCode && statusCode >= 500) {
        logger_js_1.logger.error({ statusCode, context, error }, "Error during API call");
    }
    else if (statusCode && statusCode >= 400) {
        logger_js_1.logger.warn({ statusCode, context, error }, "Error during API call");
    }
    else {
        logger_js_1.logger.error({ statusCode, context, error }, "Error during API call");
    }
    if (error instanceof Error) {
        throw new DatadogApiError(error.message, statusCode, context);
    }
    throw new DatadogApiError(`An unexpected error occurred during ${context}`, statusCode, context);
}

import { logger } from "./logger.js";

/**
 * Maps operation contexts to their required Datadog Application Key scopes.
 * Used to provide helpful error messages when permission issues occur.
 */
const SCOPE_HINTS: Record<string, string> = {
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
  "searching spans": "apm_read",
  "aggregating spans": "apm_read",
  "getting services": "apm_service_catalog_read",
  "getting trace": "apm_read",
};

/**
 * Finds the required scope for a given context using prefix matching.
 * Handles dynamic contexts like "fetching monitor 12345" by matching against "fetching monitor".
 */
function findRequiredScope(context: string): string | undefined {
  // First try exact match
  if (SCOPE_HINTS[context]) {
    return SCOPE_HINTS[context];
  }
  // Fall back to prefix matching for dynamic contexts (e.g., "fetching monitor 123")
  for (const [prefix, scope] of Object.entries(SCOPE_HINTS)) {
    if (context.startsWith(prefix)) {
      return scope;
    }
  }
  return undefined;
}

/**
 * Custom error class for Datadog API errors with status code information
 */
export class DatadogApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly context?: string,
  ) {
    super(message);
    this.name = "DatadogApiError";
  }
}

/**
 * Error response structure from raw API calls
 */
interface RawApiError {
  status?: number;
  message?: string;
  code?: number;
  body?: unknown;
}

/**
 * Type guard to check if an error is a raw API error
 */
function isRawApiError(error: unknown): error is RawApiError {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const err = error as Record<string, unknown>;
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
export function handleApiError(error: unknown, context: string): never {
  const statusCode = isRawApiError(error) ? (error.status ?? error.code) : undefined;

  if (statusCode === 403) {
    const requiredScope = findRequiredScope(context);
    const scopeHint = requiredScope
      ? ` This operation requires the '${requiredScope}' scope on your Application Key.`
      : "";

    logger.warn(
      { statusCode: 403, context, requiredScope },
      `Authorization failed (403 Forbidden): Check that your API key and Application key are valid and have sufficient permissions.${scopeHint}`,
    );

    throw new DatadogApiError(
      `Datadog API authorization failed while ${context}. Your Application Key may be missing required scope permissions.${scopeHint} Go to Datadog Organization Settings → Application Keys to add the required scope.`,
      403,
      context,
    );
  }

  if (statusCode === 404) {
    logger.warn({ statusCode: 404, context }, "Resource not found (404)");
    throw new DatadogApiError("The requested resource was not found.", 404, context);
  }

  if (statusCode === 429) {
    logger.warn({ statusCode: 429, context }, "Rate limit exceeded (429)");
    throw new DatadogApiError(
      "Rate limit exceeded. Please wait before making more requests.",
      429,
      context,
    );
  }

  // Generic error handling
  if (statusCode && statusCode >= 500) {
    logger.error({ statusCode, context, error }, "Error during API call");
  } else if (statusCode && statusCode >= 400) {
    logger.warn({ statusCode, context, error }, "Error during API call");
  } else {
    logger.error({ statusCode, context, error }, "Error during API call");
  }

  if (error instanceof Error) {
    throw new DatadogApiError(error.message, statusCode, context);
  }

  throw new DatadogApiError(`An unexpected error occurred during ${context}`, statusCode, context);
}

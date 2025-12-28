/**
 * Common response types for Datadog API endpoints that use raw HTTP calls.
 * These supplement the types from @datadog/datadog-api-client.
 */

/**
 * Log entry from the Datadog Logs API
 */
export interface LogEntry {
  id?: string;
  type?: string;
  attributes?: {
    timestamp?: string;
    status?: string;
    message?: string;
    service?: string;
    host?: string;
    tags?: string[];
    [key: string]: unknown;
  };
}

/**
 * Response from the logs search endpoint
 */
export interface LogsSearchResponse {
  data?: LogEntry[];
  meta?: {
    page?: {
      after?: string;
    };
    status?: string;
    elapsed?: number;
    request_id?: string;
  };
  links?: {
    next?: string;
  };
}

/**
 * Aggregation bucket from logs analytics
 */
export interface LogsAggregateBucket {
  by?: Record<string, string>;
  computes?: Record<string, number>;
}

/**
 * Response from the logs aggregate endpoint
 */
export interface LogsAggregateResponse {
  data?: {
    buckets?: LogsAggregateBucket[];
  };
  meta?: {
    status?: string;
    elapsed?: number;
    request_id?: string;
    page?: {
      after?: string;
    };
  };
}

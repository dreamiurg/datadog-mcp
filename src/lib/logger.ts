import pino from "pino";

/**
 * Detect if we should use pretty printing for development.
 * Enable with LOG_FORMAT=pretty or NODE_ENV=development
 */
const isPretty = process.env.LOG_FORMAT === "pretty" || process.env.NODE_ENV === "development";

/**
 * Transport configuration based on environment.
 * - Development: pretty-printed, colorized output
 * - Production: JSON format for log aggregators
 */
const transport = isPretty
  ? {
      target: "pino-pretty",
      options: {
        destination: 2, // stderr
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      },
    }
  : {
      target: "pino/file",
      options: { destination: 2 }, // stderr
    };

/**
 * Structured logger for the Datadog MCP Server.
 *
 * Logs to stderr to avoid interfering with MCP protocol on stdout.
 *
 * Configuration:
 * - LOG_LEVEL: debug, info, warn, error (default: info)
 * - LOG_FORMAT: pretty for human-readable, json for structured (default: json)
 * - NODE_ENV: development enables pretty format automatically
 */
export const logger = pino({
  name: "datadog-mcp",
  level: process.env.LOG_LEVEL || "info",
  transport,
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    pid: process.pid,
  },
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
});

/**
 * Create a child logger with additional context.
 * Use this for tool-specific logging.
 */
export function createToolLogger(toolName: string) {
  return logger.child({ tool: toolName });
}

/**
 * Create a child logger for HTTP operations.
 */
export function createHttpLogger(service: string) {
  return logger.child({ service, component: "http" });
}

export type Logger = pino.Logger;

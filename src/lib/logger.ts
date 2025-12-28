import pino from "pino";

/**
 * Structured logger for the Datadog MCP Server.
 *
 * Logs to stderr to avoid interfering with MCP protocol on stdout.
 * Uses JSON format for structured logging that can be parsed by log aggregators.
 */
export const logger = pino({
  name: "datadog-mcp-server",
  level: process.env.LOG_LEVEL || "info",
  // MCP uses stdout for protocol communication, so logs must go to stderr
  transport: {
    target: "pino/file",
    options: { destination: 2 }, // 2 = stderr
  },
  // Add timestamp in ISO format for readability
  timestamp: pino.stdTimeFunctions.isoTime,
  // Base context included in every log
  base: {
    pid: process.pid,
  },
  // Format error objects properly
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

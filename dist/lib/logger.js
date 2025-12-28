"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.createToolLogger = createToolLogger;
exports.createHttpLogger = createHttpLogger;
const pino_1 = __importDefault(require("pino"));
/**
 * Structured logger for the Datadog MCP Server.
 *
 * Logs to stderr to avoid interfering with MCP protocol on stdout.
 * Uses JSON format for structured logging that can be parsed by log aggregators.
 */
exports.logger = (0, pino_1.default)({
    name: "datadog-mcp-server",
    level: process.env.LOG_LEVEL || "info",
    // MCP uses stdout for protocol communication, so logs must go to stderr
    transport: {
        target: "pino/file",
        options: { destination: 2 }, // 2 = stderr
    },
    // Add timestamp in ISO format for readability
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
    // Base context included in every log
    base: {
        pid: process.pid,
    },
    // Format error objects properly
    serializers: {
        err: pino_1.default.stdSerializers.err,
        error: pino_1.default.stdSerializers.err,
    },
});
/**
 * Create a child logger with additional context.
 * Use this for tool-specific logging.
 */
function createToolLogger(toolName) {
    return exports.logger.child({ tool: toolName });
}
/**
 * Create a child logger for HTTP operations.
 */
function createHttpLogger(service) {
    return exports.logger.child({ service, component: "http" });
}

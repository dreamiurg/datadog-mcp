#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const dotenv_1 = __importDefault(require("dotenv"));
const minimist_1 = __importDefault(require("minimist"));
const zod_1 = require("zod");
// Import logger
const index_js_1 = require("./lib/index.js");
// Import tools
const aggregateLogs_js_1 = require("./tools/aggregateLogs.js");
const getDashboard_js_1 = require("./tools/getDashboard.js");
const getDashboards_js_1 = require("./tools/getDashboards.js");
const getEvents_js_1 = require("./tools/getEvents.js");
const getIncidents_js_1 = require("./tools/getIncidents.js");
const getMetricMetadata_js_1 = require("./tools/getMetricMetadata.js");
const getMetrics_js_1 = require("./tools/getMetrics.js");
const getMonitor_js_1 = require("./tools/getMonitor.js");
const getMonitors_js_1 = require("./tools/getMonitors.js");
const searchLogs_js_1 = require("./tools/searchLogs.js");
// Helper function to mask sensitive credentials for logging
const maskCredential = (credential) => {
    if (!credential || credential.length <= 6) {
        return "***";
    }
    const first3 = credential.slice(0, 3);
    const last3 = credential.slice(-3);
    return `${first3}...${last3}`;
};
// Parse command line arguments
const argv = (0, minimist_1.default)(process.argv.slice(2));
// Load environment variables from .env file (if it exists)
dotenv_1.default.config();
// Define environment variables - from command line or .env file
const DD_API_KEY = argv.apiKey || process.env.DD_API_KEY;
const DD_APP_KEY = argv.appKey || process.env.DD_APP_KEY;
// Get site configuration - defines the base domain for Datadog APIs
const DD_SITE = argv.site || process.env.DD_SITE || "datadoghq.com";
// Define service-specific endpoints for different Datadog services
// This follows Datadog's recommended approach for configuring regional endpoints
const DD_LOGS_SITE = argv.logsSite || process.env.DD_LOGS_SITE || DD_SITE;
const DD_METRICS_SITE = argv.metricsSite || process.env.DD_METRICS_SITE || DD_SITE;
// Remove https:// prefix if it exists to prevent double prefix issues
const cleanupUrl = (url) => (url.startsWith("https://") ? url.substring(8) : url);
// Store clean values in process.env for backwards compatibility
process.env.DD_API_KEY = DD_API_KEY;
process.env.DD_APP_KEY = DD_APP_KEY;
process.env.DD_SITE = cleanupUrl(DD_SITE);
process.env.DD_LOGS_SITE = cleanupUrl(DD_LOGS_SITE);
process.env.DD_METRICS_SITE = cleanupUrl(DD_METRICS_SITE);
// Validate required environment variables
if (!DD_API_KEY) {
    index_js_1.logger.error("DD_API_KEY is required");
    index_js_1.logger.error("Please provide it via command line argument or .env file");
    index_js_1.logger.error("Command line: --apiKey=your_api_key");
    process.exit(1);
}
if (!DD_APP_KEY) {
    index_js_1.logger.error("DD_APP_KEY is required");
    index_js_1.logger.error("Please provide it via command line argument or .env file");
    index_js_1.logger.error("Command line: --appKey=your_app_key");
    process.exit(1);
}
// Log server startup with configuration
index_js_1.logger.info({
    version: "1.0.0",
    site: DD_SITE,
    logsSite: DD_LOGS_SITE,
    metricsSite: DD_METRICS_SITE,
    apiKey: maskCredential(DD_API_KEY),
    appKey: maskCredential(DD_APP_KEY),
}, "Starting Datadog MCP Server");
// Initialize Datadog client tools
// We initialize each tool which will use the appropriate site configuration
index_js_1.logger.info("Initializing Datadog tools");
getMonitors_js_1.getMonitors.initialize();
index_js_1.logger.info({ tool: "get-monitors" }, "Tool initialized");
getMonitor_js_1.getMonitor.initialize();
index_js_1.logger.info({ tool: "get-monitor" }, "Tool initialized");
getDashboards_js_1.getDashboards.initialize();
index_js_1.logger.info({ tool: "get-dashboards" }, "Tool initialized");
getDashboard_js_1.getDashboard.initialize();
index_js_1.logger.info({ tool: "get-dashboard" }, "Tool initialized");
getMetrics_js_1.getMetrics.initialize();
index_js_1.logger.info({ tool: "get-metrics" }, "Tool initialized");
getMetricMetadata_js_1.getMetricMetadata.initialize();
index_js_1.logger.info({ tool: "get-metric-metadata" }, "Tool initialized");
getEvents_js_1.getEvents.initialize();
index_js_1.logger.info({ tool: "get-events" }, "Tool initialized");
getIncidents_js_1.getIncidents.initialize();
index_js_1.logger.info({ tool: "get-incidents" }, "Tool initialized");
searchLogs_js_1.searchLogs.initialize();
index_js_1.logger.info({ tool: "search-logs" }, "Tool initialized");
aggregateLogs_js_1.aggregateLogs.initialize();
index_js_1.logger.info({ tool: "aggregate-logs" }, "Tool initialized");
// Set up MCP server
const server = new mcp_js_1.McpServer({
    name: "datadog",
    version: "1.0.0",
    description: "MCP Server for Datadog API, enabling interaction with Datadog resources",
});
// Add tools individually, using their schemas directly
server.tool("get-monitors", "Fetch monitors from Datadog with optional filtering. Use groupStates to filter by monitor status (e.g., 'alert', 'warn', 'no data'), tags or monitorTags to filter by tag criteria, and limit to control result size.", {
    groupStates: zod_1.z.array(zod_1.z.string()).optional(),
    tags: zod_1.z.string().optional(),
    monitorTags: zod_1.z.string().optional(),
    limit: zod_1.z.number().default(100),
}, async (args) => {
    const startTime = Date.now();
    index_js_1.logger.info({ tool: "get-monitors", args }, "Tool call started");
    const result = await getMonitors_js_1.getMonitors.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount = Array.isArray(result) ? result.length : 0;
    index_js_1.logger.debug({ tool: "get-monitors", resultCount, durationMs }, "Tool execution completed");
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    };
});
server.tool("get-monitor", "Get detailed information about a specific Datadog monitor by its ID. Use this to retrieve the complete configuration, status, and other details of a single monitor.", {
    monitorId: zod_1.z.number(),
}, async (args) => {
    const startTime = Date.now();
    index_js_1.logger.info({ tool: "get-monitor", args }, "Tool call started");
    const result = await getMonitor_js_1.getMonitor.execute(args);
    const durationMs = Date.now() - startTime;
    index_js_1.logger.debug({ tool: "get-monitor", durationMs }, "Tool execution completed");
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    };
});
server.tool("get-dashboards", "Retrieve a list of all dashboards from Datadog. Useful for discovering available dashboards and their IDs for further exploration.", {
    filterConfigured: zod_1.z.boolean().optional(),
    limit: zod_1.z.number().default(100),
}, async (args) => {
    const startTime = Date.now();
    index_js_1.logger.info({ tool: "get-dashboards", args }, "Tool call started");
    const result = await getDashboards_js_1.getDashboards.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount = result && "dashboards" in result && Array.isArray(result.dashboards)
        ? result.dashboards.length
        : 0;
    index_js_1.logger.debug({ tool: "get-dashboards", resultCount, durationMs }, "Tool execution completed");
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    };
});
server.tool("get-dashboard", "Get the complete definition of a specific Datadog dashboard by its ID. Returns all widgets, layout, and configuration details.", {
    dashboardId: zod_1.z.string(),
}, async (args) => {
    const startTime = Date.now();
    index_js_1.logger.info({ tool: "get-dashboard", args }, "Tool call started");
    const result = await getDashboard_js_1.getDashboard.execute(args);
    const durationMs = Date.now() - startTime;
    index_js_1.logger.debug({ tool: "get-dashboard", durationMs }, "Tool execution completed");
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    };
});
server.tool("get-metrics", "List available metrics from Datadog. Optionally use the q parameter to search for specific metrics matching a pattern. Helpful for discovering metrics to use in monitors or dashboards.", {
    q: zod_1.z.string().optional(),
}, async (args) => {
    const startTime = Date.now();
    index_js_1.logger.info({ tool: "get-metrics", args }, "Tool call started");
    const result = await getMetrics_js_1.getMetrics.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount = result && "metrics" in result && Array.isArray(result.metrics)
        ? result.metrics.length
        : 0;
    index_js_1.logger.debug({ tool: "get-metrics", resultCount, durationMs }, "Tool execution completed");
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    };
});
server.tool("get-metric-metadata", "Retrieve detailed metadata about a specific metric, including its type, description, unit, and other attributes. Use this to understand a metric's meaning and proper usage.", {
    metricName: zod_1.z.string(),
}, async (args) => {
    const startTime = Date.now();
    index_js_1.logger.info({ tool: "get-metric-metadata", args }, "Tool call started");
    const result = await getMetricMetadata_js_1.getMetricMetadata.execute(args);
    const durationMs = Date.now() - startTime;
    index_js_1.logger.debug({ tool: "get-metric-metadata", durationMs }, "Tool execution completed");
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    };
});
server.tool("get-events", "Search for events in Datadog within a specified time range. Events include deployments, alerts, comments, and other activities. Useful for correlating system behaviors with specific events.", {
    start: zod_1.z.number(),
    end: zod_1.z.number(),
    priority: zod_1.z.enum(["normal", "low"]).optional(),
    sources: zod_1.z.string().optional(),
    tags: zod_1.z.string().optional(),
    unaggregated: zod_1.z.boolean().optional(),
    excludeAggregation: zod_1.z.boolean().optional(),
    limit: zod_1.z.number().default(100),
}, async (args) => {
    const startTime = Date.now();
    index_js_1.logger.info({ tool: "get-events", args }, "Tool call started");
    const result = await getEvents_js_1.getEvents.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount = result && "events" in result && Array.isArray(result.events)
        ? result.events.length
        : 0;
    index_js_1.logger.debug({ tool: "get-events", resultCount, durationMs }, "Tool execution completed");
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    };
});
server.tool("get-incidents", "List incidents from Datadog's incident management system. Can filter by active/archived status and use query strings to find specific incidents. Helpful for reviewing current or past incidents.", {
    includeArchived: zod_1.z.boolean().optional(),
    pageSize: zod_1.z.number().optional(),
    pageOffset: zod_1.z.number().optional(),
    query: zod_1.z.string().optional(),
    limit: zod_1.z.number().default(100),
}, async (args) => {
    const startTime = Date.now();
    index_js_1.logger.info({ tool: "get-incidents", args }, "Tool call started");
    const result = await getIncidents_js_1.getIncidents.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount = result && "incidents" in result && Array.isArray(result.incidents)
        ? result.incidents.length
        : 0;
    index_js_1.logger.debug({ tool: "get-incidents", resultCount, durationMs }, "Tool execution completed");
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    };
});
server.tool("search-logs", "Search logs in Datadog with advanced filtering options. Use filter.query for search terms (e.g., 'service:web-app status:error'), from/to for time ranges (e.g., 'now-15m', 'now'), and sort to order results. Essential for investigating application issues.", {
    filter: zod_1.z
        .object({
        query: zod_1.z.string().optional(),
        from: zod_1.z.string().optional(),
        to: zod_1.z.string().optional(),
        indexes: zod_1.z.array(zod_1.z.string()).optional(),
    })
        .optional(),
    sort: zod_1.z.string().optional(),
    page: zod_1.z
        .object({
        limit: zod_1.z.number().optional(),
        cursor: zod_1.z.string().optional(),
    })
        .optional(),
    limit: zod_1.z.number().default(100),
}, async (args) => {
    const startTime = Date.now();
    index_js_1.logger.info({ tool: "search-logs", args }, "Tool call started");
    const result = await searchLogs_js_1.searchLogs.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount = result && "logs" in result && Array.isArray(result.logs)
        ? result.logs.length
        : 0;
    index_js_1.logger.debug({ tool: "search-logs", resultCount, durationMs }, "Tool execution completed");
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    };
});
server.tool("aggregate-logs", "Perform analytical queries and aggregations on log data. Essential for calculating metrics (count, avg, sum, etc.), grouping data by fields, and creating statistical summaries from logs. Use this when you need to analyze patterns or extract metrics from log data.", {
    filter: zod_1.z
        .object({
        query: zod_1.z.string().optional(),
        from: zod_1.z.string().optional(),
        to: zod_1.z.string().optional(),
        indexes: zod_1.z.array(zod_1.z.string()).optional(),
    })
        .optional(),
    compute: zod_1.z
        .array(zod_1.z.object({
        aggregation: zod_1.z.string(),
        metric: zod_1.z.string().optional(),
        type: zod_1.z.string().optional(),
    }))
        .optional(),
    groupBy: zod_1.z
        .array(zod_1.z.object({
        facet: zod_1.z.string(),
        limit: zod_1.z.number().optional(),
        sort: zod_1.z
            .object({
            aggregation: zod_1.z.string(),
            order: zod_1.z.string(),
        })
            .optional(),
    }))
        .optional(),
    options: zod_1.z
        .object({
        timezone: zod_1.z.string().optional(),
    })
        .optional(),
}, async (args) => {
    const startTime = Date.now();
    index_js_1.logger.info({ tool: "aggregate-logs", args }, "Tool call started");
    const result = await aggregateLogs_js_1.aggregateLogs.execute(args);
    const durationMs = Date.now() - startTime;
    index_js_1.logger.debug({ tool: "aggregate-logs", durationMs }, "Tool execution completed");
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    };
});
// Start the server
const transport = new stdio_js_1.StdioServerTransport();
server
    .connect(transport)
    .then(() => {
    index_js_1.logger.info("Server connected successfully");
})
    .catch((error) => {
    index_js_1.logger.error({ error: error instanceof Error ? error.message : String(error) }, "Server connection failure");
});

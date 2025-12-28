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
    console.error("Error: DD_API_KEY is required.");
    console.error("Please provide it via command line argument or .env file.");
    console.error(" Command line: --apiKey=your_api_key");
    process.exit(1);
}
if (!DD_APP_KEY) {
    console.error("Error: DD_APP_KEY is required.");
    console.error("Please provide it via command line argument or .env file.");
    console.error(" Command line: --appKey=your_app_key");
    process.exit(1);
}
// Initialize Datadog client tools
// We initialize each tool which will use the appropriate site configuration
getMonitors_js_1.getMonitors.initialize();
getMonitor_js_1.getMonitor.initialize();
getDashboards_js_1.getDashboards.initialize();
getDashboard_js_1.getDashboard.initialize();
getMetrics_js_1.getMetrics.initialize();
getMetricMetadata_js_1.getMetricMetadata.initialize();
getEvents_js_1.getEvents.initialize();
getIncidents_js_1.getIncidents.initialize();
searchLogs_js_1.searchLogs.initialize();
aggregateLogs_js_1.aggregateLogs.initialize();
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
    const result = await getMonitors_js_1.getMonitors.execute(args);
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    };
});
server.tool("get-monitor", "Get detailed information about a specific Datadog monitor by its ID. Use this to retrieve the complete configuration, status, and other details of a single monitor.", {
    monitorId: zod_1.z.number(),
}, async (args) => {
    const result = await getMonitor_js_1.getMonitor.execute(args);
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    };
});
server.tool("get-dashboards", "Retrieve a list of all dashboards from Datadog. Useful for discovering available dashboards and their IDs for further exploration.", {
    filterConfigured: zod_1.z.boolean().optional(),
    limit: zod_1.z.number().default(100),
}, async (args) => {
    const result = await getDashboards_js_1.getDashboards.execute(args);
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    };
});
server.tool("get-dashboard", "Get the complete definition of a specific Datadog dashboard by its ID. Returns all widgets, layout, and configuration details.", {
    dashboardId: zod_1.z.string(),
}, async (args) => {
    const result = await getDashboard_js_1.getDashboard.execute(args);
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    };
});
server.tool("get-metrics", "List available metrics from Datadog. Optionally use the q parameter to search for specific metrics matching a pattern. Helpful for discovering metrics to use in monitors or dashboards.", {
    q: zod_1.z.string().optional(),
}, async (args) => {
    const result = await getMetrics_js_1.getMetrics.execute(args);
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    };
});
server.tool("get-metric-metadata", "Retrieve detailed metadata about a specific metric, including its type, description, unit, and other attributes. Use this to understand a metric's meaning and proper usage.", {
    metricName: zod_1.z.string(),
}, async (args) => {
    const result = await getMetricMetadata_js_1.getMetricMetadata.execute(args);
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
    const result = await getEvents_js_1.getEvents.execute(args);
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
    const result = await getIncidents_js_1.getIncidents.execute(args);
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
    const result = await searchLogs_js_1.searchLogs.execute(args);
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
    const result = await aggregateLogs_js_1.aggregateLogs.execute(args);
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    };
});
// Start the server
const transport = new stdio_js_1.StdioServerTransport();
server
    .connect(transport)
    .then(() => { })
    .catch((error) => {
    console.error("Failed to start Datadog MCP Server:", error);
});

#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const dotenv_1 = __importDefault(require("dotenv"));
const minimist_1 = __importDefault(require("minimist"));
const zod_1 = require("zod");
// Import logger
const index_js_1 = require("./lib/index.js");
// Read version from package.json (works in both CommonJS and ESM)
const packageJsonPath = (0, node_path_1.join)(__dirname, "..", "package.json");
const packageJson = JSON.parse((0, node_fs_1.readFileSync)(packageJsonPath, "utf-8"));
const VERSION = packageJson.version;
// Import tools
const aggregateLogs_js_1 = require("./tools/aggregateLogs.js");
const getDashboard_js_1 = require("./tools/getDashboard.js");
const getDashboards_js_1 = require("./tools/getDashboards.js");
const getDowntimes_js_1 = require("./tools/getDowntimes.js");
const getEvents_js_1 = require("./tools/getEvents.js");
const getHosts_js_1 = require("./tools/getHosts.js");
const getIncidents_js_1 = require("./tools/getIncidents.js");
const getMetricMetadata_js_1 = require("./tools/getMetricMetadata.js");
const getMetrics_js_1 = require("./tools/getMetrics.js");
const getMonitor_js_1 = require("./tools/getMonitor.js");
const getMonitors_js_1 = require("./tools/getMonitors.js");
const getSLO_js_1 = require("./tools/getSLO.js");
const getSLOs_js_1 = require("./tools/getSLOs.js");
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
    version: VERSION,
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
getHosts_js_1.getHosts.initialize();
index_js_1.logger.info({ tool: "get-hosts" }, "Tool initialized");
getDowntimes_js_1.getDowntimes.initialize();
index_js_1.logger.info({ tool: "get-downtimes" }, "Tool initialized");
getSLOs_js_1.getSLOs.initialize();
index_js_1.logger.info({ tool: "get-slos" }, "Tool initialized");
getSLO_js_1.getSLO.initialize();
index_js_1.logger.info({ tool: "get-slo" }, "Tool initialized");
// Set up MCP server
const server = new mcp_js_1.McpServer({
    name: "datadog",
    version: VERSION,
    description: "MCP Server for Datadog API, enabling interaction with Datadog resources",
});
// Add tools individually, using their schemas directly
server.tool("get-monitors", "List Datadog monitors with filtering. Use for questions like 'show alerting monitors', 'what monitors are in warning state', or 'monitors tagged with team:platform'. Filter by groupStates: 'alert', 'warn', 'no data', 'ok'. Use get-monitor for a single monitor's full details.", {
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
server.tool("get-monitor", "Get full details for a specific monitor by ID. Use after get-monitors to dive deeper into a specific monitor's configuration, thresholds, query, and current state. Returns complete monitor definition.", {
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
server.tool("get-dashboards", "List all Datadog dashboards. Use to answer 'what dashboards exist', 'find dashboard for API metrics', or to get dashboard IDs for get-dashboard. Returns dashboard names, IDs, and URLs.", {
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
server.tool("get-dashboard", "Get full dashboard definition by ID. Returns all widgets, queries, and layout. Use after get-dashboards to explore a specific dashboard's contents and understand what metrics/data it displays.", {
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
server.tool("get-metrics", "Search for available Datadog metrics by name pattern. Use to discover metrics like 'what CPU metrics exist' or 'find metrics for service X'. Parameter q searches metric names (e.g., q='aws.ec2' finds all EC2 metrics).", {
    q: zod_1.z.string().optional(),
}, async (args) => {
    const startTime = Date.now();
    index_js_1.logger.info({ tool: "get-metrics", args }, "Tool call started");
    const result = await getMetrics_js_1.getMetrics.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount = result && "metrics" in result && Array.isArray(result.metrics) ? result.metrics.length : 0;
    index_js_1.logger.debug({ tool: "get-metrics", resultCount, durationMs }, "Tool execution completed");
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    };
});
server.tool("get-metric-metadata", "Get metadata for a specific metric name. Returns type (gauge/count/rate), unit, description, and integration. Use when you need to understand what a metric measures, e.g., 'what does system.cpu.user mean'.", {
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
server.tool("get-events", "Query Datadog events within a time range. Events include deployments, alerts, configuration changes, and comments. Use for 'what happened yesterday', 'show deployment events', or correlating incidents with changes. Requires start/end as Unix timestamps.", {
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
    const resultCount = result && "events" in result && Array.isArray(result.events) ? result.events.length : 0;
    index_js_1.logger.debug({ tool: "get-events", resultCount, durationMs }, "Tool execution completed");
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    };
});
server.tool("get-incidents", "List Datadog incidents for incident management. Use for 'show active incidents', 'what incidents happened this week', or 'find incidents related to payments'. Includes severity, status, commander, and timeline.", {
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
server.tool("search-logs", "Search and retrieve log entries from Datadog. Use for 'find errors in auth service', 'show logs from last hour', or investigating issues. Query syntax: 'service:web-app status:error', time range: 'now-15m' to 'now'. Returns actual log messages. Use aggregate-logs for counts/stats instead.", {
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
    const resultCount = result && "data" in result && Array.isArray(result.data) ? result.data.length : 0;
    index_js_1.logger.debug({ tool: "search-logs", resultCount, durationMs }, "Tool execution completed");
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    };
});
server.tool("aggregate-logs", "Compute statistics and aggregations on logs. Use for 'how many errors per service', 'count logs by status', or 'average response time from logs'. Supports count, avg, sum, min, max, percentiles. Use search-logs to see actual log content instead.", {
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
server.tool("get-hosts", "List infrastructure hosts reporting to Datadog. Use for 'show production hosts', 'which hosts are muted', 'hosts running agent version X'. Returns host names, IPs, apps, agent info, and mute status. Essential for infrastructure visibility during incidents.", {
    filter: zod_1.z.string().optional().describe("Filter hosts by name substring"),
    sortField: zod_1.z.string().optional().describe("Field to sort by (e.g., 'name', 'apps', 'cpu')"),
    sortDir: zod_1.z.string().optional().describe("Sort direction ('asc' or 'desc')"),
    start: zod_1.z.number().optional().describe("Starting offset for pagination"),
    count: zod_1.z.number().optional().describe("Number of hosts to return (max 1000)"),
    from: zod_1.z.number().optional().describe("Unix timestamp to filter hosts seen after"),
    includeMutedHostsData: zod_1.z.boolean().optional().describe("Include mute status and expiry"),
    includeHostsMetadata: zod_1.z
        .boolean()
        .optional()
        .describe("Include host metadata (agent version, platform)"),
}, async (args) => {
    const startTime = Date.now();
    index_js_1.logger.info({ tool: "get-hosts", args }, "Tool call started");
    const result = await getHosts_js_1.getHosts.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount = result && "hostList" in result ? result.hostList?.length || 0 : 0;
    index_js_1.logger.debug({ tool: "get-hosts", resultCount, durationMs }, "Tool execution completed");
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    };
});
server.tool("get-downtimes", "List scheduled maintenance downtimes in Datadog. Use for 'are there any active downtimes', 'what's scheduled for maintenance', 'why is this monitor muted'. Shows scope, schedule, and duration. Critical for on-call to understand muted monitors.", {
    currentOnly: zod_1.z.boolean().optional().describe("Return only currently active downtimes"),
    include: zod_1.z
        .string()
        .optional()
        .describe("Comma-separated list to include (e.g., 'created_by,monitor')"),
    pageOffset: zod_1.z.number().optional().describe("Pagination offset"),
    pageLimit: zod_1.z.number().optional().describe("Number of downtimes to return"),
}, async (args) => {
    const startTime = Date.now();
    index_js_1.logger.info({ tool: "get-downtimes", args }, "Tool call started");
    const result = await getDowntimes_js_1.getDowntimes.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount = result && "data" in result ? result.data?.length || 0 : 0;
    index_js_1.logger.debug({ tool: "get-downtimes", resultCount, durationMs }, "Tool execution completed");
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    };
});
server.tool("get-slos", "List Service Level Objectives (SLOs). Use for 'show all SLOs', 'SLOs for team platform', 'which SLOs are at risk'. Returns SLO names, targets, and current status. Use get-slo for detailed error budget and history of a specific SLO.", {
    ids: zod_1.z.string().optional().describe("Comma-separated list of SLO IDs to fetch"),
    query: zod_1.z.string().optional().describe("Search SLOs by name"),
    tagsQuery: zod_1.z.string().optional().describe("Filter by tags (e.g., 'team:platform,env:prod')"),
    metricsQuery: zod_1.z.string().optional().describe("Filter by metrics used in SLO"),
    limit: zod_1.z.number().optional().describe("Number of SLOs to return"),
    offset: zod_1.z.number().optional().describe("Pagination offset"),
}, async (args) => {
    const startTime = Date.now();
    index_js_1.logger.info({ tool: "get-slos", args }, "Tool call started");
    const result = await getSLOs_js_1.getSLOs.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount = result && "data" in result ? result.data?.length || 0 : 0;
    index_js_1.logger.debug({ tool: "get-slos", resultCount, durationMs }, "Tool execution completed");
    return {
        content: [{ type: "text", text: JSON.stringify(result) }],
    };
});
server.tool("get-slo", "Get detailed SLO information by ID. Returns error budget remaining, burn rate, target vs actual, thresholds, and configured alerts. Use after get-slos to understand a specific SLO's health and history.", {
    sloId: zod_1.z.string().describe("The ID of the SLO to retrieve"),
    withConfiguredAlertIds: zod_1.z
        .boolean()
        .optional()
        .describe("Include IDs of monitors configured as SLO alerts"),
}, async (args) => {
    const startTime = Date.now();
    index_js_1.logger.info({ tool: "get-slo", args }, "Tool call started");
    const result = await getSLO_js_1.getSLO.execute(args);
    const durationMs = Date.now() - startTime;
    index_js_1.logger.debug({ tool: "get-slo", durationMs }, "Tool execution completed");
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
// Graceful shutdown handling
const shutdown = async (signal) => {
    index_js_1.logger.info({ signal }, "Received shutdown signal, closing server...");
    try {
        await server.close();
        index_js_1.logger.info("Server closed successfully");
        process.exit(0);
    }
    catch (error) {
        index_js_1.logger.error({ error }, "Error during shutdown");
        process.exit(1);
    }
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

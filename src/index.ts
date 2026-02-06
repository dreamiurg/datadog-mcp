#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import minimist from "minimist";
import { z } from "zod";

// Import logger
import { logger } from "./lib/index.js";

// Read version from package.json (works in both CommonJS and ESM)
const packageJsonPath = join(__dirname, "..", "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as { version: string };
const VERSION = packageJson.version;

// Import tools
import { aggregateLogs } from "./tools/aggregateLogs.js";
import { aggregateSpans } from "./tools/aggregateSpans.js";
import { getAuditEvents } from "./tools/getAuditEvents.js";
import { getContainers } from "./tools/getContainers.js";
import { getDashboard } from "./tools/getDashboard.js";
import { getDashboards } from "./tools/getDashboards.js";
import { getDbmSamples } from "./tools/getDbmSamples.js";
import { getDowntimes } from "./tools/getDowntimes.js";
import { getEvents } from "./tools/getEvents.js";
import { getHosts } from "./tools/getHosts.js";
import { getHostTags } from "./tools/getHostTags.js";
import { getIncidents } from "./tools/getIncidents.js";
import { getLogIndexes } from "./tools/getLogIndexes.js";
import { getLogPipelines } from "./tools/getLogPipelines.js";
import { getMetricMetadata } from "./tools/getMetricMetadata.js";
import { getMetrics } from "./tools/getMetrics.js";
import { getMonitor } from "./tools/getMonitor.js";
import { getMonitors } from "./tools/getMonitors.js";
import { getNotebooks } from "./tools/getNotebooks.js";
import { getSecurityFinding } from "./tools/getSecurityFinding.js";
import { getServices } from "./tools/getServices.js";
import { getSLO } from "./tools/getSLO.js";
import { getSLOs } from "./tools/getSLOs.js";
import { getSloHistory } from "./tools/getSloHistory.js";
import { getSyntheticResults } from "./tools/getSyntheticResults.js";
import { getSyntheticTests } from "./tools/getSyntheticTests.js";
import { getTrace } from "./tools/getTrace.js";
import { getUsage } from "./tools/getUsage.js";
import { listPostureFindings } from "./tools/listPostureFindings.js";
import { listRumApplications } from "./tools/listRumApplications.js";
// New observability tools
import { queryMetrics } from "./tools/queryMetrics.js";
import { searchErrorTrackingEvents } from "./tools/searchErrorTrackingEvents.js";
import { searchLogs } from "./tools/searchLogs.js";
import { searchRumEvents } from "./tools/searchRumEvents.js";
import { searchSecurityFindings } from "./tools/searchSecurityFindings.js";
import { searchSpans } from "./tools/searchSpans.js";

// Helper function to mask sensitive credentials for logging
const maskCredential = (credential: string | undefined): string => {
  if (!credential || credential.length <= 4) {
    return "***";
  }
  return `***${credential.slice(-4)}`;
};

// Parse command line arguments
const argv = minimist(process.argv.slice(2));

// Load environment variables from .env file (if it exists)
dotenv.config();

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
const cleanupUrl = (url: string) => (url.startsWith("https://") ? url.substring(8) : url);

// Store clean values in process.env for backwards compatibility
process.env.DD_API_KEY = DD_API_KEY;
process.env.DD_APP_KEY = DD_APP_KEY;
process.env.DD_SITE = cleanupUrl(DD_SITE);
process.env.DD_LOGS_SITE = cleanupUrl(DD_LOGS_SITE);
process.env.DD_METRICS_SITE = cleanupUrl(DD_METRICS_SITE);

// Validate required environment variables
if (!DD_API_KEY) {
  logger.error("DD_API_KEY is required");
  logger.error("Please provide it via command line argument or .env file");
  logger.error("Command line: --apiKey=your_api_key");
  process.exit(1);
}

if (!DD_APP_KEY) {
  logger.error("DD_APP_KEY is required");
  logger.error("Please provide it via command line argument or .env file");
  logger.error("Command line: --appKey=your_app_key");
  process.exit(1);
}

// Log server startup with configuration (credentials are masked for security)
const maskedApiKey = maskCredential(DD_API_KEY);
const maskedAppKey = maskCredential(DD_APP_KEY);
logger.info(
  {
    version: VERSION,
    site: DD_SITE,
    logsSite: DD_LOGS_SITE,
    metricsSite: DD_METRICS_SITE,
    apiKeyPreview: maskedApiKey,
    appKeyPreview: maskedAppKey,
  },
  "Starting Datadog MCP Server",
);

// Initialize Datadog client tools
// We initialize each tool which will use the appropriate site configuration
logger.info("Initializing Datadog tools");
getMonitors.initialize();
logger.info({ tool: "get-monitors" }, "Tool initialized");
getMonitor.initialize();
logger.info({ tool: "get-monitor" }, "Tool initialized");
getDashboards.initialize();
logger.info({ tool: "get-dashboards" }, "Tool initialized");
getDashboard.initialize();
logger.info({ tool: "get-dashboard" }, "Tool initialized");
getMetrics.initialize();
logger.info({ tool: "get-metrics" }, "Tool initialized");
getMetricMetadata.initialize();
logger.info({ tool: "get-metric-metadata" }, "Tool initialized");
getEvents.initialize();
logger.info({ tool: "get-events" }, "Tool initialized");
getIncidents.initialize();
logger.info({ tool: "get-incidents" }, "Tool initialized");
searchLogs.initialize();
logger.info({ tool: "search-logs" }, "Tool initialized");
aggregateLogs.initialize();
logger.info({ tool: "aggregate-logs" }, "Tool initialized");
getHosts.initialize();
logger.info({ tool: "get-hosts" }, "Tool initialized");
getDowntimes.initialize();
logger.info({ tool: "get-downtimes" }, "Tool initialized");
getSLOs.initialize();
logger.info({ tool: "get-slos" }, "Tool initialized");
getSLO.initialize();
logger.info({ tool: "get-slo" }, "Tool initialized");
searchSpans.initialize();
logger.info({ tool: "search-spans" }, "Tool initialized");
aggregateSpans.initialize();
logger.info({ tool: "aggregate-spans" }, "Tool initialized");
getServices.initialize();
logger.info({ tool: "get-services" }, "Tool initialized");
getTrace.initialize();
logger.info({ tool: "get-trace" }, "Tool initialized");
searchSecurityFindings.initialize();
logger.info({ tool: "search-security-findings" }, "Tool initialized");
getSecurityFinding.initialize();
logger.info({ tool: "get-security-finding" }, "Tool initialized");
listPostureFindings.initialize();
logger.info({ tool: "list-posture-findings" }, "Tool initialized");

// New observability tools
queryMetrics.initialize();
logger.info({ tool: "query-metrics" }, "Tool initialized");
getSyntheticTests.initialize();
logger.info({ tool: "get-synthetic-tests" }, "Tool initialized");
getSyntheticResults.initialize();
logger.info({ tool: "get-synthetic-results" }, "Tool initialized");
searchRumEvents.initialize();
logger.info({ tool: "search-rum-events" }, "Tool initialized");
listRumApplications.initialize();
logger.info({ tool: "list-rum-applications" }, "Tool initialized");
searchErrorTrackingEvents.initialize();
logger.info({ tool: "search-error-tracking-events" }, "Tool initialized");
getContainers.initialize();
logger.info({ tool: "get-containers" }, "Tool initialized");
getHostTags.initialize();
logger.info({ tool: "get-host-tags" }, "Tool initialized");
getAuditEvents.initialize();
logger.info({ tool: "get-audit-events" }, "Tool initialized");
getSloHistory.initialize();
logger.info({ tool: "get-slo-history" }, "Tool initialized");
getNotebooks.initialize();
logger.info({ tool: "get-notebooks" }, "Tool initialized");
getUsage.initialize();
logger.info({ tool: "get-usage" }, "Tool initialized");
getLogPipelines.initialize();
logger.info({ tool: "get-log-pipelines" }, "Tool initialized");
getLogIndexes.initialize();
logger.info({ tool: "get-log-indexes" }, "Tool initialized");
getDbmSamples.initialize();
logger.info({ tool: "get-dbm-samples" }, "Tool initialized");

// Set up MCP server
const server = new McpServer({
  name: "datadog",
  version: VERSION,
  description: "MCP Server for Datadog API, enabling interaction with Datadog resources",
});

// Add tools individually, using their schemas directly
server.tool(
  "get-monitors",
  "List Datadog monitors with filtering. Use for questions like 'show alerting monitors', 'what monitors are in warning state', or 'monitors tagged with team:platform'. Filter by groupStates: 'alert', 'warn', 'no data', 'ok'. Use get-monitor for a single monitor's full details.",
  {
    groupStates: z.array(z.string()).optional(),
    tags: z.string().optional(),
    monitorTags: z.string().optional(),
    limit: z.number().default(100),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-monitors", args }, "Tool call started");
    const result = await getMonitors.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount = Array.isArray(result) ? result.length : 0;
    logger.debug({ tool: "get-monitors", resultCount, durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-monitor",
  "Get full details for a specific monitor by ID. Use after get-monitors to dive deeper into a specific monitor's configuration, thresholds, query, and current state. Returns complete monitor definition.",
  {
    monitorId: z.number(),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-monitor", args }, "Tool call started");
    const result = await getMonitor.execute(args);
    const durationMs = Date.now() - startTime;
    logger.debug({ tool: "get-monitor", durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-dashboards",
  "List all Datadog dashboards. Use to answer 'what dashboards exist', 'find dashboard for API metrics', or to get dashboard IDs for get-dashboard. Returns dashboard names, IDs, and URLs.",
  {
    limit: z.number().default(100),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-dashboards", args }, "Tool call started");
    const result = await getDashboards.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount =
      result && "dashboards" in result && Array.isArray(result.dashboards)
        ? result.dashboards.length
        : 0;
    logger.debug({ tool: "get-dashboards", resultCount, durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-dashboard",
  "Get full dashboard definition by ID. Returns all widgets, queries, and layout. Use after get-dashboards to explore a specific dashboard's contents and understand what metrics/data it displays.",
  {
    dashboardId: z.string(),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-dashboard", args }, "Tool call started");
    const result = await getDashboard.execute(args);
    const durationMs = Date.now() - startTime;
    logger.debug({ tool: "get-dashboard", durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-metrics",
  "Search for available Datadog metrics by name pattern. Use to discover metrics like 'what CPU metrics exist' or 'find metrics for service X'. Parameter q searches metric names (e.g., q='aws.ec2' finds all EC2 metrics).",
  {
    q: z.string().optional(),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-metrics", args }, "Tool call started");
    const result = await getMetrics.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount =
      result?.results?.metrics && Array.isArray(result.results.metrics)
        ? result.results.metrics.length
        : 0;
    logger.debug({ tool: "get-metrics", resultCount, durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-metric-metadata",
  "Get metadata for a specific metric name. Returns type (gauge/count/rate), unit, description, and integration. Use when you need to understand what a metric measures, e.g., 'what does system.cpu.user mean'.",
  {
    metricName: z.string(),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-metric-metadata", args }, "Tool call started");
    const result = await getMetricMetadata.execute(args);
    const durationMs = Date.now() - startTime;
    logger.debug({ tool: "get-metric-metadata", durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-events",
  "Query Datadog events within a time range. Events include deployments, alerts, configuration changes, and comments. Use for 'what happened yesterday', 'show deployment events', or correlating incidents with changes. Requires start/end as Unix timestamps.",
  {
    start: z.number(),
    end: z.number(),
    priority: z.enum(["normal", "low"]).optional(),
    sources: z.string().optional(),
    tags: z.string().optional(),
    unaggregated: z.boolean().optional(),
    excludeAggregation: z.boolean().optional(),
    limit: z.number().default(100),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-events", args }, "Tool call started");
    const result = await getEvents.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount =
      result && "events" in result && Array.isArray(result.events) ? result.events.length : 0;
    logger.debug({ tool: "get-events", resultCount, durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-incidents",
  "List Datadog incidents for incident management. Use for 'show active incidents', 'what incidents happened this week', or 'find incidents related to payments'. Includes severity, status, commander, and timeline.",
  {
    pageSize: z.number().optional(),
    pageOffset: z.number().optional(),
    query: z.string().optional(),
    limit: z.number().default(100),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-incidents", args }, "Tool call started");
    const result = await getIncidents.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount =
      result && "incidents" in result && Array.isArray(result.incidents)
        ? result.incidents.length
        : 0;
    logger.debug({ tool: "get-incidents", resultCount, durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "search-logs",
  "Search and retrieve log entries from Datadog. Use for 'find errors in auth service', 'show logs from last hour', or investigating issues. Query syntax: 'service:web-app status:error', time range: 'now-15m' to 'now'. Returns actual log messages. Use aggregate-logs for counts/stats instead.",
  {
    filter: z
      .object({
        query: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        indexes: z.array(z.string()).optional(),
      })
      .optional(),
    sort: z.string().optional(),
    page: z
      .object({
        limit: z.number().optional(),
        cursor: z.string().optional(),
      })
      .optional(),
    limit: z.number().default(100),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "search-logs", args }, "Tool call started");
    const result = await searchLogs.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount =
      result && "data" in result && Array.isArray(result.data) ? result.data.length : 0;
    logger.debug({ tool: "search-logs", resultCount, durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "aggregate-logs",
  "Compute statistics and aggregations on logs. Use for 'how many errors per service', 'count logs by status', or 'average response time from logs'. Supports count, avg, sum, min, max, percentiles. Use search-logs to see actual log content instead.",
  {
    filter: z
      .object({
        query: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        indexes: z.array(z.string()).optional(),
      })
      .optional(),
    compute: z
      .array(
        z.object({
          aggregation: z.string(),
          metric: z.string().optional(),
          type: z.string().optional(),
        }),
      )
      .optional(),
    groupBy: z
      .array(
        z.object({
          facet: z.string(),
          limit: z.number().optional(),
          sort: z
            .object({
              aggregation: z.string(),
              order: z.string(),
            })
            .optional(),
        }),
      )
      .optional(),
    options: z
      .object({
        timezone: z.string().optional(),
      })
      .optional(),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "aggregate-logs", args }, "Tool call started");
    const result = await aggregateLogs.execute(args);
    const durationMs = Date.now() - startTime;
    logger.debug({ tool: "aggregate-logs", durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-hosts",
  "List infrastructure hosts reporting to Datadog. Use for 'show production hosts', 'which hosts are muted', 'hosts running agent version X'. Returns host names, IPs, apps, agent info, and mute status. Essential for infrastructure visibility during incidents.",
  {
    filter: z.string().optional().describe("Filter hosts by name substring"),
    sortField: z.string().optional().describe("Field to sort by (e.g., 'name', 'apps', 'cpu')"),
    sortDir: z.string().optional().describe("Sort direction ('asc' or 'desc')"),
    start: z.number().optional().describe("Starting offset for pagination"),
    count: z.number().optional().describe("Number of hosts to return (max 1000)"),
    from: z.number().optional().describe("Unix timestamp to filter hosts seen after"),
    includeMutedHostsData: z.boolean().optional().describe("Include mute status and expiry"),
    includeHostsMetadata: z
      .boolean()
      .optional()
      .describe("Include host metadata (agent version, platform)"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-hosts", args }, "Tool call started");
    const result = await getHosts.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount = result && "hostList" in result ? result.hostList?.length || 0 : 0;
    logger.debug({ tool: "get-hosts", resultCount, durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-downtimes",
  "List scheduled maintenance downtimes in Datadog. Use for 'are there any active downtimes', 'what's scheduled for maintenance', 'why is this monitor muted'. Shows scope, schedule, and duration. Critical for on-call to understand muted monitors.",
  {
    currentOnly: z.boolean().optional().describe("Return only currently active downtimes"),
    include: z
      .string()
      .optional()
      .describe("Comma-separated list to include (e.g., 'created_by,monitor')"),
    pageOffset: z.number().optional().describe("Pagination offset"),
    pageLimit: z.number().optional().describe("Number of downtimes to return"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-downtimes", args }, "Tool call started");
    const result = await getDowntimes.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount = result && "data" in result ? result.data?.length || 0 : 0;
    logger.debug({ tool: "get-downtimes", resultCount, durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-slos",
  "List Service Level Objectives (SLOs). Use for 'show all SLOs', 'SLOs for team platform', 'which SLOs are at risk'. Returns SLO names, targets, and current status. Use get-slo for detailed error budget and history of a specific SLO.",
  {
    ids: z.string().optional().describe("Comma-separated list of SLO IDs to fetch"),
    query: z.string().optional().describe("Search SLOs by name"),
    tagsQuery: z.string().optional().describe("Filter by tags (e.g., 'team:platform,env:prod')"),
    metricsQuery: z.string().optional().describe("Filter by metrics used in SLO"),
    limit: z.number().optional().describe("Number of SLOs to return"),
    offset: z.number().optional().describe("Pagination offset"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-slos", args }, "Tool call started");
    const result = await getSLOs.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount = result && "data" in result ? result.data?.length || 0 : 0;
    logger.debug({ tool: "get-slos", resultCount, durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-slo",
  "Get detailed SLO information by ID. Returns error budget remaining, burn rate, target vs actual, thresholds, and configured alerts. Use after get-slos to understand a specific SLO's health and history.",
  {
    sloId: z.string().describe("The ID of the SLO to retrieve"),
    withConfiguredAlertIds: z
      .boolean()
      .optional()
      .describe("Include IDs of monitors configured as SLO alerts"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-slo", args }, "Tool call started");
    const result = await getSLO.execute(args);
    const durationMs = Date.now() - startTime;
    logger.debug({ tool: "get-slo", durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "search-spans",
  "Search APM spans/traces. Use for 'find slow requests', 'show errors in payment service', or investigating latency. Query syntax: 'service:web status:error @duration:>1s'. Returns individual spans with trace IDs. Use get-trace for full trace context.",
  {
    filter: z
      .object({
        query: z.string().optional().describe("Span query (e.g., 'service:api status:error')"),
        from: z.string().optional().describe("Start time (e.g., 'now-15m' or ISO8601)"),
        to: z.string().optional().describe("End time (e.g., 'now' or ISO8601)"),
      })
      .optional(),
    sort: z.string().optional().describe("Sort order ('timestamp' or '-timestamp')"),
    page: z
      .object({
        limit: z.number().optional().describe("Number of spans per page (max 1000)"),
        cursor: z.string().optional().describe("Pagination cursor"),
      })
      .optional(),
    limit: z.number().default(100).describe("Maximum spans to return"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "search-spans", args }, "Tool call started");
    const result = await searchSpans.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount =
      result && "data" in result && Array.isArray(result.data) ? result.data.length : 0;
    logger.debug({ tool: "search-spans", resultCount, durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "aggregate-spans",
  "Compute statistics on APM spans. Use for 'p99 latency by service', 'error rate per endpoint', 'request count over time'. Supports count, avg, sum, min, max, percentiles (pc75/90/95/99). Use search-spans to see actual span details.",
  {
    filter: z
      .object({
        query: z.string().optional().describe("Span query (e.g., 'service:api')"),
        from: z.string().optional().describe("Start time"),
        to: z.string().optional().describe("End time"),
      })
      .optional(),
    compute: z
      .array(
        z.object({
          aggregation: z
            .string()
            .describe("Aggregation type (count, avg, sum, min, max, pc75, pc90, pc95, pc99)"),
          metric: z.string().optional().describe("Metric to aggregate (e.g., '@duration')"),
          type: z.string().optional().describe("Result type ('total' or 'timeseries')"),
        }),
      )
      .optional(),
    groupBy: z
      .array(
        z.object({
          facet: z.string().describe("Field to group by (e.g., 'service', 'resource_name')"),
          limit: z.number().optional().describe("Max groups to return"),
          sort: z
            .object({
              aggregation: z.string(),
              order: z.string().describe("'asc' or 'desc'"),
            })
            .optional(),
        }),
      )
      .optional(),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "aggregate-spans", args }, "Tool call started");
    const result = await aggregateSpans.execute(args);
    const durationMs = Date.now() - startTime;
    logger.debug({ tool: "aggregate-spans", durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-services",
  "List all APM-instrumented services. Use to discover traced services, find service names for span queries, or get an overview of your distributed system. Returns service names and their environments.",
  {
    env: z.string().optional().describe("Filter services by environment"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-services", args }, "Tool call started");
    const result = await getServices.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount = result?.services?.length || 0;
    logger.debug({ tool: "get-services", resultCount, durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-trace",
  "Get all spans for a specific trace ID. Use after search-spans to see the full request flow across services. Returns all spans in the trace with timing, service, resource, and error information.",
  {
    traceId: z.string().describe("The trace ID to retrieve (hexadecimal string)"),
    from: z.string().optional().describe("Start time (defaults to 'now-1h')"),
    to: z.string().optional().describe("End time (defaults to 'now')"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-trace", args }, "Tool call started");
    const result = await getTrace.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount =
      result && "data" in result && Array.isArray(result.data) ? result.data.length : 0;
    logger.debug({ tool: "get-trace", resultCount, durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "search-security-findings",
  "List or search Datadog security findings (Cloud Security Management). Use to retrieve findings with a query and optional pagination cursor. Requires security_monitoring_findings_read or appsec_vm_read (OAuth apps still require security_monitoring_findings_read).",
  {
    filter: z
      .object({
        query: z.string().optional(),
      })
      .optional(),
    page: z
      .object({
        limit: z.number().optional(),
        cursor: z.string().optional(),
      })
      .optional(),
    limit: z.number().optional(),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "search-security-findings", args }, "Tool call started");
    const result = await searchSecurityFindings.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount = Array.isArray(result?.data) ? result.data.length : 0;
    logger.debug(
      { tool: "search-security-findings", resultCount, durationMs },
      "Tool execution completed",
    );
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-security-finding",
  "Get a legacy CSPM/CIEM finding by ID (posture_management). Note: this endpoint uses the legacy data model. Requires the security_monitoring_findings_read scope.",
  {
    findingId: z.string(),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-security-finding", args }, "Tool call started");
    const result = await getSecurityFinding.execute(args);
    const durationMs = Date.now() - startTime;
    logger.debug({ tool: "get-security-finding", durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "list-posture-findings",
  "List legacy CSPM/CIEM posture management findings (misconfigurations and identity risks). Useful for compliance use-cases. Requires the security_monitoring_findings_read scope.",
  {
    filter: z
      .object({
        tags: z.array(z.string()).optional(),
        evaluation: z.enum(["pass", "fail"]).optional(),
        status: z.enum(["open", "resolved", "dismissed"]).optional(),
        ruleId: z.string().optional(),
        ruleName: z.string().optional(),
        resourceType: z.string().optional(),
        resourceId: z.string().optional(),
        muted: z.boolean().optional(),
        evaluationChangedAt: z.string().optional(),
        discoveryTimestamp: z.string().optional(),
      })
      .optional(),
    page: z
      .object({
        limit: z.number().optional(),
        cursor: z.string().optional(),
      })
      .optional(),
    snapshotTimestamp: z.number().optional(),
    detailedFindings: z.boolean().optional(),
    limit: z.number().optional(),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "list-posture-findings", args }, "Tool call started");
    const result = await listPostureFindings.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount = Array.isArray(result?.data) ? result.data.length : 0;
    logger.debug(
      { tool: "list-posture-findings", resultCount, durationMs },
      "Tool execution completed",
    );
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

// --- New observability tools ---

server.tool(
  "query-metrics",
  "Query time-series metric data from Datadog. The backbone of observability — use for 'CPU usage over last hour', 'request rate for web service', or any metric query. Query syntax: 'avg:system.cpu.user{host:web-1}'. Returns data points with timestamps.",
  {
    query: z.string().describe("Metrics query (e.g., 'avg:system.cpu.user{host:web-1}')"),
    from: z.number().describe("Start time as Unix epoch seconds"),
    to: z.number().describe("End time as Unix epoch seconds"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "query-metrics", args }, "Tool call started");
    const result = await queryMetrics.execute(args);
    const durationMs = Date.now() - startTime;
    const seriesCount = result?.series?.length || 0;
    logger.debug({ tool: "query-metrics", seriesCount, durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-synthetic-tests",
  "List Datadog Synthetic tests (API and browser). Use for 'show all synthetic tests', 'what API tests exist', or 'which tests are failing'. Returns test names, types, status, locations, and tags.",
  {
    pageSize: z.number().optional().describe("Number of tests per page"),
    pageNumber: z.number().optional().describe("Page number for pagination"),
    type: z.string().optional().describe("Filter by test type ('api' or 'browser')"),
    locations: z.string().optional().describe("Comma-separated location filter"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-synthetic-tests", args }, "Tool call started");
    const result = await getSyntheticTests.execute(args);
    const durationMs = Date.now() - startTime;
    const testCount = result?.tests?.length || 0;
    logger.debug(
      { tool: "get-synthetic-tests", testCount, durationMs },
      "Tool execution completed",
    );
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-synthetic-results",
  "Get execution results for a specific Synthetic test. Use after get-synthetic-tests to see pass/fail history, response times, and probe locations. Returns individual check results with timing data.",
  {
    publicId: z.string().describe("The synthetic test's public ID"),
    fromTs: z.number().optional().describe("Start timestamp (Unix epoch milliseconds)"),
    toTs: z.number().optional().describe("End timestamp (Unix epoch milliseconds)"),
    probeDc: z.array(z.string()).optional().describe("Filter by probe datacenter locations"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-synthetic-results", args }, "Tool call started");
    const result = await getSyntheticResults.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount = result?.results?.length || 0;
    logger.debug(
      { tool: "get-synthetic-results", resultCount, durationMs },
      "Tool execution completed",
    );
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "search-rum-events",
  "Search Real User Monitoring (RUM) events. Use for 'frontend errors in production', 'slow page loads', 'user session analysis'. Query syntax similar to logs: '@type:error @application.id:abc'. Returns user sessions, views, actions, and errors.",
  {
    filter: z
      .object({
        query: z.string().optional().describe("RUM query (e.g., '@type:error service:frontend')"),
        from: z.string().optional().describe("Start time (e.g., 'now-1h' or ISO8601)"),
        to: z.string().optional().describe("End time (e.g., 'now' or ISO8601)"),
      })
      .optional(),
    sort: z.string().optional().describe("Sort order ('timestamp' or '-timestamp')"),
    page: z
      .object({
        limit: z.number().optional().describe("Results per page"),
        cursor: z.string().optional().describe("Pagination cursor"),
      })
      .optional(),
    limit: z.number().default(100).describe("Maximum events to return"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "search-rum-events", args }, "Tool call started");
    const result = await searchRumEvents.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount =
      result && "data" in result && Array.isArray(result.data) ? result.data.length : 0;
    logger.debug(
      { tool: "search-rum-events", resultCount, durationMs },
      "Tool execution completed",
    );
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "list-rum-applications",
  "List all RUM applications configured in Datadog. Use to discover which frontend apps are monitored, get application IDs for RUM queries, or see who created them. Companion to search-rum-events.",
  {},
  async () => {
    const startTime = Date.now();
    logger.info({ tool: "list-rum-applications" }, "Tool call started");
    const result = await listRumApplications.execute({});
    const durationMs = Date.now() - startTime;
    const appCount =
      result && "data" in result && Array.isArray(result.data) ? result.data.length : 0;
    logger.debug(
      { tool: "list-rum-applications", appCount, durationMs },
      "Tool execution completed",
    );
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "search-error-tracking-events",
  "Search Error Tracking events across services. Use for 'what errors are happening in production', 'error groups for payment service', 'new errors this week'. Returns error groups with counts, first/last seen, and affected services.",
  {
    filter: z
      .object({
        query: z.string().optional().describe("Error tracking query"),
        from: z.string().optional().describe("Start time"),
        to: z.string().optional().describe("End time"),
      })
      .optional(),
    sort: z.string().optional().describe("Sort order"),
    page: z
      .object({
        limit: z.number().optional(),
        cursor: z.string().optional(),
      })
      .optional(),
    limit: z.number().default(100).describe("Maximum events to return"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "search-error-tracking-events", args }, "Tool call started");
    const result = await searchErrorTrackingEvents.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount =
      result && "data" in result && Array.isArray(result.data) ? result.data.length : 0;
    logger.debug(
      { tool: "search-error-tracking-events", resultCount, durationMs },
      "Tool execution completed",
    );
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-containers",
  "List containers monitored by Datadog. Use for 'show running containers', 'containers for web service', 'container status by image'. Returns container names, images, tags, state, and start time.",
  {
    filterTags: z
      .string()
      .optional()
      .describe("Comma-separated tags (e.g., 'env:prod,service:web')"),
    groupBy: z.string().optional().describe("Group by attribute (e.g., 'short_image')"),
    sort: z.string().optional().describe("Sort field (e.g., 'name', '-name')"),
    pageSize: z.number().optional().describe("Results per page"),
    pageCursor: z.string().optional().describe("Pagination cursor"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-containers", args }, "Tool call started");
    const result = await getContainers.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount =
      result && "data" in result && Array.isArray(result.data) ? result.data.length : 0;
    logger.debug({ tool: "get-containers", resultCount, durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-host-tags",
  "Get all tags associated with hosts. Use for 'what tags are on my hosts', 'which hosts have team:platform tag', or to understand host groupings. Returns a map of tag names to host lists.",
  {
    source: z
      .string()
      .optional()
      .describe("Tag source filter (e.g., 'datadog-agent', 'users', 'chef')"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-host-tags", args }, "Tool call started");
    const result = await getHostTags.execute(args);
    const durationMs = Date.now() - startTime;
    const tagCount = result?.tags ? Object.keys(result.tags).length : 0;
    logger.debug({ tool: "get-host-tags", tagCount, durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-audit-events",
  "Search Datadog organization audit events. Use for 'who changed this monitor', 'what config changes happened today', 'audit trail for user X'. Returns timestamped events with actor, action, and affected resource.",
  {
    filter: z
      .object({
        query: z
          .string()
          .optional()
          .describe("Audit query (e.g., '@action:modified @resource_type:monitor')"),
        from: z.string().optional().describe("Start time"),
        to: z.string().optional().describe("End time"),
      })
      .optional(),
    sort: z.string().optional().describe("Sort order"),
    page: z
      .object({
        limit: z.number().optional(),
        cursor: z.string().optional(),
      })
      .optional(),
    limit: z.number().default(100).describe("Maximum events to return"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-audit-events", args }, "Tool call started");
    const result = await getAuditEvents.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount =
      result && "data" in result && Array.isArray(result.data) ? result.data.length : 0;
    logger.debug({ tool: "get-audit-events", resultCount, durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-slo-history",
  "Get historical SLO data over a time range. Use after get-slo to see 'SLO performance last 30 days', 'error budget consumption over time', or 'SLI trend for checkout service'. Returns SLI values, thresholds, and time range data.",
  {
    sloId: z.string().describe("The SLO ID"),
    fromTs: z.number().describe("Start time as Unix epoch seconds"),
    toTs: z.number().describe("End time as Unix epoch seconds"),
    target: z.number().optional().describe("SLO target percentage for calculations"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-slo-history", args }, "Tool call started");
    const result = await getSloHistory.execute(args);
    const durationMs = Date.now() - startTime;
    logger.debug({ tool: "get-slo-history", durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-notebooks",
  "List Datadog notebooks. Use for 'show investigation notebooks', 'find notebooks by team', or 'recent notebooks about outage'. Notebooks are collaborative documents used during incidents and investigations.",
  {
    authorHandle: z.string().optional().describe("Filter by author's email handle"),
    excludeAuthorHandle: z.string().optional().describe("Exclude specific author"),
    count: z.number().optional().describe("Number of notebooks to return"),
    start: z.number().optional().describe("Pagination offset"),
    sortField: z.string().optional().describe("Sort field ('modified' or 'name')"),
    sortDir: z.string().optional().describe("Sort direction ('asc' or 'desc')"),
    query: z.string().optional().describe("Search notebooks by text"),
    includeCells: z.boolean().optional().describe("Include notebook cell content"),
    isTemplate: z.boolean().optional().describe("Filter by template status"),
    type: z.string().optional().describe("Filter by notebook type"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-notebooks", args }, "Tool call started");
    const result = await getNotebooks.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount =
      result && "data" in result && Array.isArray(result.data) ? result.data.length : 0;
    logger.debug({ tool: "get-notebooks", resultCount, durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-usage",
  "Get hourly usage data by product family. Use for 'how many infra hosts this month', 'log ingestion volume', 'APM usage trends'. Returns usage records with timestamps for billing and capacity planning.",
  {
    startHr: z.string().describe("Start time ISO8601 (e.g., '2024-01-01T00:00:00+00:00')"),
    endHr: z.string().optional().describe("End time ISO8601"),
    productFamilies: z
      .string()
      .optional()
      .describe("Comma-separated families (e.g., 'infra_hosts,logs,apm')"),
    pageLimit: z.number().optional().describe("Max records to return"),
    pageNextRecordId: z.string().optional().describe("Pagination cursor"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-usage", args }, "Tool call started");
    const result = await getUsage.execute(args);
    const durationMs = Date.now() - startTime;
    const recordCount =
      result && "data" in result && Array.isArray(result.data) ? result.data.length : 0;
    logger.debug({ tool: "get-usage", recordCount, durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-log-pipelines",
  "List all log processing pipelines. Use for 'how are logs being processed', 'which pipelines are active', 'what parsing rules exist'. Returns pipeline names, filters, processors, and enabled status. Essential for understanding log processing configuration.",
  {},
  async () => {
    const startTime = Date.now();
    logger.info({ tool: "get-log-pipelines" }, "Tool call started");
    const result = await getLogPipelines.execute({});
    const durationMs = Date.now() - startTime;
    const pipelineCount = Array.isArray(result) ? result.length : 0;
    logger.debug(
      { tool: "get-log-pipelines", pipelineCount, durationMs },
      "Tool execution completed",
    );
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-log-indexes",
  "List all log indexes and their configuration. Use for 'where are logs being stored', 'what retention is configured', 'which logs are being excluded'. Returns index names, filters, retention days, daily limits, and exclusion filters.",
  {},
  async () => {
    const startTime = Date.now();
    logger.info({ tool: "get-log-indexes" }, "Tool call started");
    const result = await getLogIndexes.execute({});
    const durationMs = Date.now() - startTime;
    const indexCount = result?.indexes?.length || 0;
    logger.debug({ tool: "get-log-indexes", indexCount, durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-dbm-samples",
  "Get Database Monitoring query samples. Use for 'slow database queries', 'what queries are running on postgres', 'DB performance issues'. Returns query samples with execution time, affected rows, and database context.",
  {
    start: z.number().optional().describe("Start timestamp (Unix seconds)"),
    end: z.number().optional().describe("End timestamp (Unix seconds)"),
    source: z.string().optional().describe("Database type (e.g., 'postgresql', 'mysql')"),
    dbHost: z.string().optional().describe("Database hostname filter"),
    dbName: z.string().optional().describe("Database name filter"),
    limit: z.number().optional().describe("Max results to return"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-dbm-samples", args }, "Tool call started");
    const result = await getDbmSamples.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount =
      result && "data" in result && Array.isArray(result.data) ? result.data.length : 0;
    logger.debug({ tool: "get-dbm-samples", resultCount, durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

// Start the server
const transport = new StdioServerTransport();
server
  .connect(transport)
  .then(() => {
    logger.info("Server connected successfully");
  })
  .catch((error: unknown) => {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Server connection failure",
    );
    process.exit(1);
  });

// Graceful shutdown handling
const shutdown = async (signal: string) => {
  logger.info({ signal }, "Received shutdown signal, closing server...");
  try {
    await server.close();
    logger.info("Server closed successfully");
    process.exit(0);
  } catch (error) {
    logger.error({ error }, "Error during shutdown");
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

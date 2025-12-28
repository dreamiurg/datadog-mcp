#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import minimist from "minimist";
import { z } from "zod";

// Import logger
import { logger } from "./lib/index.js";

// Import tools
import { aggregateLogs } from "./tools/aggregateLogs.js";
import { getDashboard } from "./tools/getDashboard.js";
import { getDashboards } from "./tools/getDashboards.js";
import { getEvents } from "./tools/getEvents.js";
import { getIncidents } from "./tools/getIncidents.js";
import { getMetricMetadata } from "./tools/getMetricMetadata.js";
import { getMetrics } from "./tools/getMetrics.js";
import { getMonitor } from "./tools/getMonitor.js";
import { getMonitors } from "./tools/getMonitors.js";
import { searchLogs } from "./tools/searchLogs.js";

// Helper function to mask sensitive credentials for logging
const maskCredential = (credential: string | undefined): string => {
  if (!credential || credential.length <= 6) {
    return "***";
  }
  const first3 = credential.slice(0, 3);
  const last3 = credential.slice(-3);
  return `${first3}...${last3}`;
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

// Log server startup with configuration
logger.info(
  {
    version: "1.0.0",
    site: DD_SITE,
    logsSite: DD_LOGS_SITE,
    metricsSite: DD_METRICS_SITE,
    apiKey: maskCredential(DD_API_KEY),
    appKey: maskCredential(DD_APP_KEY),
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

// Set up MCP server
const server = new McpServer({
  name: "datadog",
  version: "1.0.0",
  description: "MCP Server for Datadog API, enabling interaction with Datadog resources",
});

// Add tools individually, using their schemas directly
server.tool(
  "get-monitors",
  "Fetch monitors from Datadog with optional filtering. Use groupStates to filter by monitor status (e.g., 'alert', 'warn', 'no data'), tags or monitorTags to filter by tag criteria, and limit to control result size.",
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
  "Get detailed information about a specific Datadog monitor by its ID. Use this to retrieve the complete configuration, status, and other details of a single monitor.",
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
  "Retrieve a list of all dashboards from Datadog. Useful for discovering available dashboards and their IDs for further exploration.",
  {
    filterConfigured: z.boolean().optional(),
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
  "Get the complete definition of a specific Datadog dashboard by its ID. Returns all widgets, layout, and configuration details.",
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
  "List available metrics from Datadog. Optionally use the q parameter to search for specific metrics matching a pattern. Helpful for discovering metrics to use in monitors or dashboards.",
  {
    q: z.string().optional(),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-metrics", args }, "Tool call started");
    const result = await getMetrics.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount =
      result && "metrics" in result && Array.isArray(result.metrics) ? result.metrics.length : 0;
    logger.debug({ tool: "get-metrics", resultCount, durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "get-metric-metadata",
  "Retrieve detailed metadata about a specific metric, including its type, description, unit, and other attributes. Use this to understand a metric's meaning and proper usage.",
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
  "Search for events in Datadog within a specified time range. Events include deployments, alerts, comments, and other activities. Useful for correlating system behaviors with specific events.",
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
  "List incidents from Datadog's incident management system. Can filter by active/archived status and use query strings to find specific incidents. Helpful for reviewing current or past incidents.",
  {
    includeArchived: z.boolean().optional(),
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
  "Search logs in Datadog with advanced filtering options. Use filter.query for search terms (e.g., 'service:web-app status:error'), from/to for time ranges (e.g., 'now-15m', 'now'), and sort to order results. Essential for investigating application issues.",
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
      result && "logs" in result && Array.isArray(result.logs) ? result.logs.length : 0;
    logger.debug({ tool: "search-logs", resultCount, durationMs }, "Tool execution completed");
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  },
);

server.tool(
  "aggregate-logs",
  "Perform analytical queries and aggregations on log data. Essential for calculating metrics (count, avg, sum, etc.), grouping data by fields, and creating statistical summaries from logs. Use this when you need to analyze patterns or extract metrics from log data.",
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
  });

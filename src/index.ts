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
import { aggregateNetworkConnections } from "./tools/aggregateNetworkConnections.js";
import { aggregateRumEvents } from "./tools/aggregateRumEvents.js";
import { aggregateSpans } from "./tools/aggregateSpans.js";
import { getActiveHostsCount } from "./tools/getActiveHostsCount.js";
import { getAuditEvents } from "./tools/getAuditEvents.js";
import { getCIPipelineEvents } from "./tools/getCIPipelineEvents.js";
// Wave 8 tools
import { getCITestEvents } from "./tools/getCITestEvents.js";
import { getContainers } from "./tools/getContainers.js";
import { getCSMCoverage } from "./tools/getCSMCoverage.js";
import { getDashboard } from "./tools/getDashboard.js";
import { getDashboards } from "./tools/getDashboards.js";
import { getDbmQueryMetrics } from "./tools/getDbmQueryMetrics.js";
import { getDbmSamples } from "./tools/getDbmSamples.js";
import { getDowntimes } from "./tools/getDowntimes.js";
import { getEstimatedCost } from "./tools/getEstimatedCost.js";
import { getEvents } from "./tools/getEvents.js";
import { getHosts } from "./tools/getHosts.js";
import { getHostTags } from "./tools/getHostTags.js";
import { getHourlyUsage } from "./tools/getHourlyUsage.js";
import { getIncidentServices } from "./tools/getIncidentServices.js";
import { getIncidents } from "./tools/getIncidents.js";
import { getIncidentTimeline } from "./tools/getIncidentTimeline.js";
import { getIncidentTodos } from "./tools/getIncidentTodos.js";
import { getIPRanges } from "./tools/getIPRanges.js";
import { getLogIndexes } from "./tools/getLogIndexes.js";
import { getLogPipelines } from "./tools/getLogPipelines.js";
import { getLogsArchiveOrder } from "./tools/getLogsArchiveOrder.js";
import { getLogsArchives } from "./tools/getLogsArchives.js";
import { getLogsIndexes } from "./tools/getLogsIndexes.js";
import { getLogsMetrics } from "./tools/getLogsMetrics.js";
import { getLogsPipelineOrder } from "./tools/getLogsPipelineOrder.js";
import { getLogsPipelines } from "./tools/getLogsPipelines.js";
import { getMetricMetadata } from "./tools/getMetricMetadata.js";
import { getMetrics } from "./tools/getMetrics.js";
import { getMetricTagConfig } from "./tools/getMetricTagConfig.js";
import { getMonitor } from "./tools/getMonitor.js";
import { getMonitorConfigPolicies } from "./tools/getMonitorConfigPolicies.js";
import { getMonitors } from "./tools/getMonitors.js";
import { getNotebook } from "./tools/getNotebook.js";
import { getNotebooks } from "./tools/getNotebooks.js";
import { getOrganization } from "./tools/getOrganization.js";
import { getPowerpacks } from "./tools/getPowerpacks.js";
import { getSecurityFinding } from "./tools/getSecurityFinding.js";
import { getSensitiveDataScannerConfig } from "./tools/getSensitiveDataScannerConfig.js";
import { getServiceDefinition } from "./tools/getServiceDefinition.js";
import { getServiceDependencies } from "./tools/getServiceDependencies.js";
import { getServices } from "./tools/getServices.js";
import { getSLO } from "./tools/getSLO.js";
import { getSLOCorrections } from "./tools/getSLOCorrections.js";
import { getSLOs } from "./tools/getSLOs.js";
import { getSloHistory } from "./tools/getSloHistory.js";
import { getSpansMetrics } from "./tools/getSpansMetrics.js";
import { getSyntheticResults } from "./tools/getSyntheticResults.js";
import { getSyntheticTests } from "./tools/getSyntheticTests.js";
import { getTopAvgMetrics } from "./tools/getTopAvgMetrics.js";
import { getTrace } from "./tools/getTrace.js";
import { getUsage } from "./tools/getUsage.js";
import { listApiKeys } from "./tools/listApiKeys.js";
import { listAppKeys } from "./tools/listAppKeys.js";
import { listAuthNMappings } from "./tools/listAuthNMappings.js";
import { listAWSAccounts } from "./tools/listAWSAccounts.js";
import { listAzureIntegration } from "./tools/listAzureIntegration.js";
import { listCIPipelines } from "./tools/listCIPipelines.js";
import { listCITests } from "./tools/listCITests.js";
import { listCloudflareAccounts } from "./tools/listCloudflareAccounts.js";
import { listConfluentAccounts } from "./tools/listConfluentAccounts.js";
import { listContainers } from "./tools/listContainers.js";
import { listCostBudgets } from "./tools/listCostBudgets.js";
import { listCSMThreatsAgentRules } from "./tools/listCSMThreatsAgentRules.js";
import { listDashboardLists } from "./tools/listDashboardLists.js";
import { listDORADeployments } from "./tools/listDORADeployments.js";
import { listDowntimeSchedules } from "./tools/listDowntimeSchedules.js";
import { listFleetAgents } from "./tools/listFleetAgents.js";
import { listGCPIntegration } from "./tools/listGCPIntegration.js";
import { listHostTotals } from "./tools/listHostTotals.js";
import { listLogsMetrics } from "./tools/listLogsMetrics.js";
import { listMetricTagConfigs } from "./tools/listMetricTagConfigs.js";
import { listMonitorNotificationRules } from "./tools/listMonitorNotificationRules.js";
import { listNetworkDevices } from "./tools/listNetworkDevices.js";
import { listNotebooks } from "./tools/listNotebooks.js";
import { listPermissions } from "./tools/listPermissions.js";
import { listPostureFindings } from "./tools/listPostureFindings.js";
import { listProcesses } from "./tools/listProcesses.js";
import { listRestrictionPolicies } from "./tools/listRestrictionPolicies.js";
import { listRoles } from "./tools/listRoles.js";
import { listRumApplications } from "./tools/listRumApplications.js";
import { listScorecardOutcomes } from "./tools/listScorecardOutcomes.js";
import { listScorecardRules } from "./tools/listScorecardRules.js";
import { listSecurityMonitoringRules } from "./tools/listSecurityMonitoringRules.js";
import { listSecurityRules } from "./tools/listSecurityRules.js";
import { listServiceDefinitions } from "./tools/listServiceDefinitions.js";
import { listSpansMetrics } from "./tools/listSpansMetrics.js";
import { listSyntheticsGlobalVariables } from "./tools/listSyntheticsGlobalVariables.js";
import { listSyntheticsLocations } from "./tools/listSyntheticsLocations.js";
import { listSyntheticsPrivateLocations } from "./tools/listSyntheticsPrivateLocations.js";
import { listTeamMembers } from "./tools/listTeamMembers.js";
import { listTeams } from "./tools/listTeams.js";
import { listUsers } from "./tools/listUsers.js";
import { listVulnerabilities } from "./tools/listVulnerabilities.js";
import { listWebhooks } from "./tools/listWebhooks.js";
import { listWorkflowExecutions } from "./tools/listWorkflowExecutions.js";
import { listWorkflows } from "./tools/listWorkflows.js";
// New observability tools
import { queryMetrics } from "./tools/queryMetrics.js";
import { searchAuditLogs } from "./tools/searchAuditLogs.js";
import { searchCases } from "./tools/searchCases.js";
import { searchErrorTrackingEvents } from "./tools/searchErrorTrackingEvents.js";
import { searchErrorTrackingIssues } from "./tools/searchErrorTrackingIssues.js";
import { searchIncidents } from "./tools/searchIncidents.js";
import { searchLogs } from "./tools/searchLogs.js";
import { searchMetricVolumes } from "./tools/searchMetricVolumes.js";
import { searchRumEvents } from "./tools/searchRumEvents.js";
import { searchSecurityFindings } from "./tools/searchSecurityFindings.js";
import { searchSecuritySignals } from "./tools/searchSecuritySignals.js";
import { searchSLOs } from "./tools/searchSLOs.js";
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
aggregateRumEvents.initialize();
logger.info({ tool: "aggregate-rum-events" }, "Tool initialized");
getActiveHostsCount.initialize();
logger.info({ tool: "get-active-hosts-count" }, "Tool initialized");
listProcesses.initialize();
logger.info({ tool: "list-processes" }, "Tool initialized");
listServiceDefinitions.initialize();
logger.info({ tool: "list-service-definitions" }, "Tool initialized");
getServiceDefinition.initialize();
logger.info({ tool: "get-service-definition" }, "Tool initialized");
listCIPipelines.initialize();
logger.info({ tool: "list-ci-pipelines" }, "Tool initialized");
getCIPipelineEvents.initialize();
logger.info({ tool: "get-ci-pipeline-events" }, "Tool initialized");
listTeams.initialize();
logger.info({ tool: "list-teams" }, "Tool initialized");
listUsers.initialize();
logger.info({ tool: "list-users" }, "Tool initialized");
searchSecuritySignals.initialize();
logger.info({ tool: "search-security-signals" }, "Tool initialized");
listDashboardLists.initialize();
logger.info({ tool: "list-dashboard-lists" }, "Tool initialized");
searchMetricVolumes.initialize();
logger.info({ tool: "search-metric-volumes" }, "Tool initialized");
listRoles.initialize();
logger.info({ tool: "list-roles" }, "Tool initialized");
listPermissions.initialize();
logger.info({ tool: "list-permissions" }, "Tool initialized");
getLogsMetrics.initialize();
logger.info({ tool: "get-logs-metrics" }, "Tool initialized");
getSpansMetrics.initialize();
logger.info({ tool: "get-spans-metrics" }, "Tool initialized");
getLogsArchives.initialize();
logger.info({ tool: "get-logs-archives" }, "Tool initialized");
getServiceDependencies.initialize();
logger.info({ tool: "get-service-dependencies" }, "Tool initialized");
listScorecardRules.initialize();
logger.info({ tool: "list-scorecard-rules" }, "Tool initialized");
listScorecardOutcomes.initialize();
logger.info({ tool: "list-scorecard-outcomes" }, "Tool initialized");
searchCases.initialize();
logger.info({ tool: "search-cases" }, "Tool initialized");
getPowerpacks.initialize();
logger.info({ tool: "get-powerpacks" }, "Tool initialized");
getLogsIndexes.initialize();
logger.info({ tool: "get-logs-indexes" }, "Tool initialized");
getLogsPipelines.initialize();
logger.info({ tool: "get-logs-pipelines" }, "Tool initialized");
searchAuditLogs.initialize();
logger.info({ tool: "search-audit-logs" }, "Tool initialized");
getHourlyUsage.initialize();
logger.info({ tool: "get-hourly-usage" }, "Tool initialized");
listContainers.initialize();
logger.info({ tool: "list-containers" }, "Tool initialized");
searchErrorTrackingIssues.initialize();
logger.info({ tool: "search-error-tracking-issues" }, "Tool initialized");
listNotebooks.initialize();
logger.info({ tool: "list-notebooks" }, "Tool initialized");
getNotebook.initialize();
logger.info({ tool: "get-notebook" }, "Tool initialized");
listSecurityRules.initialize();
logger.info({ tool: "list-security-rules" }, "Tool initialized");
listApiKeys.initialize();
logger.info({ tool: "list-api-keys" }, "Tool initialized");
getIncidentTodos.initialize();
logger.info({ tool: "get-incident-todos" }, "Tool initialized");
listAWSAccounts.initialize();
logger.info({ tool: "list-aws-accounts" }, "Tool initialized");
aggregateNetworkConnections.initialize();
logger.info({ tool: "aggregate-network-connections" }, "Tool initialized");
getCSMCoverage.initialize();
logger.info({ tool: "get-csm-coverage" }, "Tool initialized");
getTopAvgMetrics.initialize();
logger.info({ tool: "get-top-avg-metrics" }, "Tool initialized");
listCostBudgets.initialize();
logger.info({ tool: "list-cost-budgets" }, "Tool initialized");
listCSMThreatsAgentRules.initialize();
logger.info({ tool: "list-csm-threats-agent-rules" }, "Tool initialized");
listDORADeployments.initialize();
logger.info({ tool: "list-dora-deployments" }, "Tool initialized");
listFleetAgents.initialize();
logger.info({ tool: "list-fleet-agents" }, "Tool initialized");
listMonitorNotificationRules.initialize();
logger.info({ tool: "list-monitor-notification-rules" }, "Tool initialized");
listNetworkDevices.initialize();
logger.info({ tool: "list-network-devices" }, "Tool initialized");
listVulnerabilities.initialize();
logger.info({ tool: "list-vulnerabilities" }, "Tool initialized");
listWorkflows.initialize();
logger.info({ tool: "list-workflows" }, "Tool initialized");
searchIncidents.initialize();
logger.info({ tool: "search-incidents" }, "Tool initialized");
getSLOCorrections.initialize();
logger.info({ tool: "get-slo-corrections" }, "Tool initialized");
getIPRanges.initialize();
logger.info({ tool: "get-ip-ranges" }, "Tool initialized");
getLogsPipelineOrder.initialize();
logger.info({ tool: "get-logs-pipeline-order" }, "Tool initialized");
getLogsArchiveOrder.initialize();
logger.info({ tool: "get-logs-archive-order" }, "Tool initialized");
searchSLOs.initialize();
logger.info({ tool: "search-slos" }, "Tool initialized");
getEstimatedCost.initialize();
logger.info({ tool: "get-estimated-cost" }, "Tool initialized");
listSyntheticsGlobalVariables.initialize();
logger.info({ tool: "list-synthetics-global-variables" }, "Tool initialized");
listDowntimeSchedules.initialize();
logger.info({ tool: "list-downtime-schedules" }, "Tool initialized");
listSpansMetrics.initialize();
logger.info({ tool: "list-spans-metrics" }, "Tool initialized");
getMonitorConfigPolicies.initialize();
logger.info({ tool: "get-monitor-config-policies" }, "Tool initialized");
listSyntheticsLocations.initialize();
logger.info({ tool: "list-synthetics-locations" }, "Tool initialized");
listLogsMetrics.initialize();
logger.info({ tool: "list-logs-metrics" }, "Tool initialized");
getOrganization.initialize();
logger.info({ tool: "get-organization" }, "Tool initialized");
listHostTotals.initialize();
logger.info({ tool: "list-host-totals" }, "Tool initialized");
listWebhooks.initialize();
logger.info({ tool: "list-webhooks" }, "Tool initialized");
listSyntheticsPrivateLocations.initialize();
logger.info({ tool: "list-synthetics-private-locations" }, "Tool initialized");
listSecurityMonitoringRules.initialize();
logger.info({ tool: "list-security-monitoring-rules" }, "Tool initialized");
getSensitiveDataScannerConfig.initialize();
logger.info({ tool: "get-sensitive-data-scanner-config" }, "Tool initialized");
getIncidentServices.initialize();
logger.info({ tool: "get-incident-services" }, "Tool initialized");
listGCPIntegration.initialize();
logger.info({ tool: "list-gcp-integration" }, "Tool initialized");
listAzureIntegration.initialize();
logger.info({ tool: "list-azure-integration" }, "Tool initialized");
listCloudflareAccounts.initialize();
logger.info({ tool: "list-cloudflare-accounts" }, "Tool initialized");
listRestrictionPolicies.initialize();
logger.info({ tool: "list-restriction-policies" }, "Tool initialized");
listConfluentAccounts.initialize();
logger.info({ tool: "list-confluent-accounts" }, "Tool initialized");
listCITests.initialize();
logger.info({ tool: "list-ci-tests" }, "Tool initialized");
getCITestEvents.initialize();
logger.info({ tool: "get-ci-test-events" }, "Tool initialized");
getIncidentTimeline.initialize();
logger.info({ tool: "get-incident-timeline" }, "Tool initialized");
listTeamMembers.initialize();
logger.info({ tool: "list-team-members" }, "Tool initialized");
listAppKeys.initialize();
logger.info({ tool: "list-app-keys" }, "Tool initialized");
getMetricTagConfig.initialize();
logger.info({ tool: "get-metric-tag-config" }, "Tool initialized");
listMetricTagConfigs.initialize();
logger.info({ tool: "list-metric-tag-configs" }, "Tool initialized");
listAuthNMappings.initialize();
logger.info({ tool: "list-authn-mappings" }, "Tool initialized");
listWorkflowExecutions.initialize();
logger.info({ tool: "list-workflow-executions" }, "Tool initialized");
getDbmQueryMetrics.initialize();
logger.info({ tool: "get-dbm-query-metrics" }, "Tool initialized");

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
    host_name: z.string().describe("Host name to get tags for"),
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

server.tool(
  "aggregate-rum-events",
  "Aggregate RUM events with compute operations (count, avg, sum, min, max, percentile) and group-by facets. Use for 'RUM page load times by country', 'error count by browser', 'average session duration by app version'.",
  {
    compute: z
      .array(
        z.object({
          aggregation: z
            .string()
            .describe("Aggregation type: count, avg, sum, min, max, percentile"),
          metric: z.string().optional().describe("Metric to aggregate on"),
          type: z.string().optional().describe("Type of compute: timeseries or total"),
        }),
      )
      .describe("Compute operations to perform"),
    filter: z
      .object({
        query: z.string().optional().describe("RUM query filter"),
        from: z.string().optional().describe("Start time (ISO 8601)"),
        to: z.string().optional().describe("End time (ISO 8601)"),
      })
      .optional()
      .describe("Filter criteria"),
    group_by: z
      .array(
        z.object({
          facet: z.string().describe("Facet to group by"),
          limit: z.number().optional().describe("Max groups"),
          sort: z
            .object({
              aggregation: z.string().describe("Sort aggregation"),
              order: z.string().optional().describe("Sort order: asc or desc"),
            })
            .optional(),
        }),
      )
      .optional()
      .describe("Group-by facets"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "aggregate-rum-events" }, "Tool call started");
    const result = await aggregateRumEvents.execute(args);
    const durationMs = Date.now() - startTime;
    logger.debug({ tool: "aggregate-rum-events", durationMs }, "Tool execution completed");
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  },
);

server.tool(
  "get-active-hosts-count",
  "Get total number of active and up hosts. Use for 'how many hosts are running', 'infrastructure host count', 'active host summary'.",
  {
    from: z.number().optional().describe("Seconds since Unix epoch to scope the count"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-active-hosts-count" }, "Tool call started");
    const result = await getActiveHostsCount.execute(args);
    const durationMs = Date.now() - startTime;
    logger.debug({ tool: "get-active-hosts-count", durationMs }, "Tool execution completed");
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  },
);

server.tool(
  "list-processes",
  "List running processes with optional filtering by search term or tags. Use for 'what processes are running', 'find java processes', 'process list for host'.",
  {
    search: z.string().optional().describe("Search term to filter processes"),
    tags: z.string().optional().describe("Comma-separated tags to filter"),
    from: z.number().optional().describe("Start timestamp (Unix seconds)"),
    to: z.number().optional().describe("End timestamp (Unix seconds)"),
    pageLimit: z.number().optional().describe("Max results per page"),
    pageCursor: z.string().optional().describe("Pagination cursor"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "list-processes" }, "Tool call started");
    const result = await listProcesses.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount =
      result && "data" in result && Array.isArray(result.data) ? result.data.length : 0;
    logger.debug({ tool: "list-processes", resultCount, durationMs }, "Tool execution completed");
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  },
);

server.tool(
  "list-service-definitions",
  "List service definitions from the Datadog Service Catalog. Use for 'what services exist', 'service catalog', 'list all registered services'.",
  {
    pageSize: z.number().optional().describe("Number of results per page"),
    pageNumber: z.number().optional().describe("Page number"),
    schemaVersion: z.string().optional().describe("Schema version: v1, v2, v2.1, or v2.2"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "list-service-definitions" }, "Tool call started");
    const result = await listServiceDefinitions.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount =
      result && "data" in result && Array.isArray(result.data) ? result.data.length : 0;
    logger.debug(
      { tool: "list-service-definitions", resultCount, durationMs },
      "Tool execution completed",
    );
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  },
);

server.tool(
  "get-service-definition",
  "Get a single service definition by name from the Service Catalog. Use for 'show service X details', 'what team owns service Y', 'service definition for Z'.",
  {
    serviceName: z.string().describe("The service name to look up"),
    schemaVersion: z.string().optional().describe("Schema version: v1, v2, v2.1, or v2.2"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-service-definition", service: args.serviceName }, "Tool call started");
    const result = await getServiceDefinition.execute(args);
    const durationMs = Date.now() - startTime;
    logger.debug({ tool: "get-service-definition", durationMs }, "Tool execution completed");
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  },
);

server.tool(
  "list-ci-pipelines",
  "List CI pipeline events (pipeline runs/executions). Use for 'recent CI builds', 'failed pipelines', 'CI pipeline status', 'deployment history'.",
  {
    filterQuery: z.string().optional().describe("Query to filter pipeline events"),
    filterFrom: z.string().optional().describe("Start time (ISO 8601)"),
    filterTo: z.string().optional().describe("End time (ISO 8601)"),
    pageLimit: z.number().optional().describe("Max results per page"),
    pageCursor: z.string().optional().describe("Pagination cursor"),
    sort: z.string().optional().describe("Sort field"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "list-ci-pipelines" }, "Tool call started");
    const result = await listCIPipelines.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount =
      result && "data" in result && Array.isArray(result.data) ? result.data.length : 0;
    logger.debug(
      { tool: "list-ci-pipelines", resultCount, durationMs },
      "Tool execution completed",
    );
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  },
);

server.tool(
  "get-ci-pipeline-events",
  "Aggregate CI pipeline analytics with compute operations. Use for 'average pipeline duration', 'failure rate by pipeline', 'CI performance trends'.",
  {
    compute: z
      .array(
        z.object({
          aggregation: z.string().describe("Aggregation type: count, avg, sum, min, max"),
          metric: z.string().optional().describe("Metric to aggregate"),
          type: z.string().optional().describe("Compute type"),
        }),
      )
      .describe("Compute operations"),
    filter: z
      .object({
        query: z.string().optional().describe("Pipeline query filter"),
        from: z.string().optional().describe("Start time (ISO 8601)"),
        to: z.string().optional().describe("End time (ISO 8601)"),
      })
      .optional(),
    group_by: z
      .array(
        z.object({
          facet: z.string().describe("Facet to group by"),
          limit: z.number().optional().describe("Max groups"),
        }),
      )
      .optional(),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "get-ci-pipeline-events" }, "Tool call started");
    const result = await getCIPipelineEvents.execute(args);
    const durationMs = Date.now() - startTime;
    logger.debug({ tool: "get-ci-pipeline-events", durationMs }, "Tool execution completed");
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  },
);

server.tool(
  "list-teams",
  "List teams in the Datadog organization. Use for 'what teams exist', 'team structure', 'find team by name'.",
  {
    pageNumber: z.number().optional().describe("Page number"),
    pageSize: z.number().optional().describe("Results per page"),
    sort: z.string().optional().describe("Sort field: name, -name, user_count, -user_count"),
    filterKeyword: z.string().optional().describe("Filter teams by keyword"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "list-teams" }, "Tool call started");
    const result = await listTeams.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount =
      result && "data" in result && Array.isArray(result.data) ? result.data.length : 0;
    logger.debug({ tool: "list-teams", resultCount, durationMs }, "Tool execution completed");
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  },
);

server.tool(
  "list-users",
  "List users in the Datadog organization. Use for 'who has access', 'list all users', 'find user by email'.",
  {
    pageSize: z.number().optional().describe("Results per page"),
    pageNumber: z.number().optional().describe("Page number"),
    sort: z.string().optional().describe("Sort field"),
    sortDir: z.string().optional().describe("Sort direction: asc or desc"),
    filter: z.string().optional().describe("Filter by name or email"),
    filterStatus: z.string().optional().describe("Filter by status: Active, Pending, Disabled"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "list-users" }, "Tool call started");
    const result = await listUsers.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount =
      result && "data" in result && Array.isArray(result.data) ? result.data.length : 0;
    logger.debug({ tool: "list-users", resultCount, durationMs }, "Tool execution completed");
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  },
);

server.tool(
  "search-security-signals",
  "Search security monitoring signals (threat detections, security alerts). Use for 'recent security alerts', 'threat detections', 'security signal search'.",
  {
    filter: z
      .object({
        query: z.string().optional().describe("Security signal query"),
        from: z.string().optional().describe("Start time (ISO 8601)"),
        to: z.string().optional().describe("End time (ISO 8601)"),
      })
      .optional(),
    sort: z.string().optional().describe("Sort order"),
    page: z
      .object({
        limit: z.number().optional().describe("Max results"),
        cursor: z.string().optional().describe("Pagination cursor"),
      })
      .optional(),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "search-security-signals" }, "Tool call started");
    const result = await searchSecuritySignals.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount =
      result && "data" in result && Array.isArray(result.data) ? result.data.length : 0;
    logger.debug(
      { tool: "search-security-signals", resultCount, durationMs },
      "Tool execution completed",
    );
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  },
);

server.tool(
  "list-dashboard-lists",
  "List all custom dashboard lists. Use for 'what dashboard lists exist', 'organized dashboards', 'dashboard collections'.",
  {},
  async () => {
    const startTime = Date.now();
    logger.info({ tool: "list-dashboard-lists" }, "Tool call started");
    const result = await listDashboardLists.execute({});
    const durationMs = Date.now() - startTime;
    const listCount = result?.dashboard_lists?.length || 0;
    logger.debug(
      { tool: "list-dashboard-lists", listCount, durationMs },
      "Tool execution completed",
    );
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  },
);

server.tool(
  "search-metric-volumes",
  "Search metrics by name pattern with volume and ingestion data. Use for 'find metrics matching pattern', 'metric ingestion volume', 'what metrics are configured'.",
  {
    filterMetric: z.string().optional().describe("Metric name filter with wildcard support"),
    filterConfigured: z.boolean().optional().describe("Only show configured metrics"),
    filterTagsConfigured: z.string().optional().describe("Filter by tag configuration"),
    filterActiveWithin: z.number().optional().describe("Only metrics active within N hours"),
    windowSeconds: z.number().optional().describe("Time window for volume data"),
  },
  async (args) => {
    const startTime = Date.now();
    logger.info({ tool: "search-metric-volumes" }, "Tool call started");
    const result = await searchMetricVolumes.execute(args);
    const durationMs = Date.now() - startTime;
    const resultCount =
      result && "data" in result && Array.isArray(result.data) ? result.data.length : 0;
    logger.debug(
      { tool: "search-metric-volumes", resultCount, durationMs },
      "Tool execution completed",
    );
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  },
);

server.tool(
  "list-roles",
  "List RBAC roles in your Datadog organization",
  {
    page_size: z.number().optional().describe("Number of roles per page"),
    page_number: z.number().optional().describe("Page number"),
    filter: z.string().optional().describe("Filter roles by name"),
  },
  async (args) => {
    const result = await listRoles.execute(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool("list-permissions", "List all available permissions in Datadog", {}, async (args) => {
  const result = await listPermissions.execute(args);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

server.tool("get-logs-metrics", "Get all log-based metric configurations", {}, async (args) => {
  const result = await getLogsMetrics.execute(args);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

server.tool(
  "get-spans-metrics",
  "Get all span-based metric configurations from APM",
  {},
  async (args) => {
    const result = await getSpansMetrics.execute(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "get-logs-archives",
  "Get log archive configurations showing where logs are stored",
  {},
  async (args) => {
    const result = await getLogsArchives.execute(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "get-service-dependencies",
  "Get service dependency graph for APM services in a given environment",
  {
    env: z.string().describe("Environment name (e.g. production, staging)"),
  },
  async (args) => {
    const result = await getServiceDependencies.execute(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list-scorecard-rules",
  "List service scorecard rules for evaluating service quality",
  {
    page_size: z.number().optional().describe("Number of results per page"),
    page_offset: z.number().optional().describe("Page offset"),
    filter_rule_id: z.string().optional().describe("Filter by rule ID"),
    filter_rule_name: z.string().optional().describe("Filter by rule name"),
  },
  async (args) => {
    const result = await listScorecardRules.execute(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list-scorecard-outcomes",
  "List scorecard rule evaluation outcomes for services",
  {
    page_size: z.number().optional().describe("Number of results per page"),
    page_offset: z.number().optional().describe("Page offset"),
    filter_rule_id: z.string().optional().describe("Filter by rule ID"),
    filter_service_name: z.string().optional().describe("Filter by service name"),
  },
  async (args) => {
    const result = await listScorecardOutcomes.execute(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "search-cases",
  "Search Datadog cases for incident investigation",
  {
    page_size: z.number().optional().describe("Number of results per page"),
    page_offset: z.number().optional().describe("Page offset"),
    sort_field: z.string().optional().describe("Field to sort by"),
    filter: z.string().optional().describe("Filter expression"),
    sort_asc: z.boolean().optional().describe("Sort ascending"),
  },
  async (args) => {
    const result = await searchCases.execute(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "get-powerpacks",
  "Get reusable dashboard widget templates (Powerpacks)",
  {
    page_limit: z.number().optional().describe("Maximum number of results"),
    page_offset: z.number().optional().describe("Page offset"),
  },
  async (args) => {
    const result = await getPowerpacks.execute(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "get-logs-indexes",
  "Get log index configurations including retention and exclusion filters",
  {},
  async (args) => {
    const result = await getLogsIndexes.execute(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "get-logs-pipelines",
  "Get log processing pipeline configurations",
  {},
  async (args) => {
    const result = await getLogsPipelines.execute(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "search_audit_logs",
  "Search Datadog audit logs for configuration changes, user actions, and API calls",
  {
    filter_query: z.string().optional().describe("Audit log search query"),
    filter_from: z.string().optional().describe("Start time (ISO 8601)"),
    filter_to: z.string().optional().describe("End time (ISO 8601)"),
    page_limit: z.number().optional().describe("Max results per page"),
    page_cursor: z.string().optional().describe("Pagination cursor"),
    sort: z.string().optional().describe("Sort order (timestamp or -timestamp)"),
  },
  async (args) => {
    const result = await searchAuditLogs.execute(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "get_hourly_usage",
  "Get Datadog hourly usage by product family for cost analysis",
  {
    filter_timestamp_start: z.string().describe("Start time (ISO 8601, required)"),
    filter_timestamp_end: z.string().optional().describe("End time (ISO 8601)"),
    filter_product_families: z
      .string()
      .describe("Comma-separated product families (e.g. infra_hosts,logs)"),
    page_limit: z.number().optional().describe("Max results per page"),
    page_next_record_id: z.string().optional().describe("Pagination record ID"),
  },
  async (args) => {
    const result = await getHourlyUsage.execute(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_containers",
  "List Datadog-monitored containers with their metadata and health status",
  {
    filter_tags: z.string().optional().describe("Filter by tags (e.g. env:prod)"),
    group_by: z.string().optional().describe("Group results by field"),
    sort: z.string().optional().describe("Sort field"),
    page_size: z.number().optional().describe("Page size"),
    page_cursor: z.string().optional().describe("Pagination cursor"),
  },
  async (args) => {
    const result = await listContainers.execute(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "search_error_tracking_issues",
  "Search Datadog error tracking issues for user-facing errors and exceptions",
  {
    filter_query: z.string().optional().describe("Error tracking search query"),
    filter_from: z.string().optional().describe("Start time (ISO 8601)"),
    filter_to: z.string().optional().describe("End time (ISO 8601)"),
    page_limit: z.number().optional().describe("Max results per page"),
    page_cursor: z.string().optional().describe("Pagination cursor"),
    sort: z.string().optional().describe("Sort order"),
  },
  async (args) => {
    const result = await searchErrorTrackingIssues.execute(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_notebooks",
  "List Datadog notebooks (investigation documents, runbooks, postmortems)",
  {
    query: z.string().optional().describe("Search query for notebook name"),
    count: z.number().optional().describe("Number of notebooks to return"),
    start: z.number().optional().describe("Offset for pagination"),
    sort_field: z.string().optional().describe("Field to sort by (e.g. modified)"),
    sort_dir: z.string().optional().describe("Sort direction (asc or desc)"),
    author_handle: z.string().optional().describe("Filter by author handle"),
  },
  async (args) => {
    const result = await listNotebooks.execute(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "get_notebook",
  "Get a specific Datadog notebook by ID with all cells and content",
  {
    notebook_id: z.number().describe("Notebook ID"),
  },
  async (args) => {
    const result = await getNotebook.execute(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_security_rules",
  "List Datadog security monitoring detection rules",
  {
    page_size: z.number().optional().describe("Number of rules per page"),
    page_number: z.number().optional().describe("Page number"),
  },
  async (args) => {
    const result = await listSecurityRules.execute(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_api_keys",
  "List Datadog API keys for key management and security audit",
  {
    page_size: z.number().optional().describe("Number of keys per page"),
    page_number: z.number().optional().describe("Page number"),
    filter: z.string().optional().describe("Filter by key name"),
    sort: z.string().optional().describe("Sort field"),
  },
  async (args) => {
    const result = await listApiKeys.execute(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "get_incident_todos",
  "Get action items/todos for a specific Datadog incident",
  {
    incident_id: z.string().describe("Incident ID"),
  },
  async (args) => {
    const result = await getIncidentTodos.execute(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_aws_accounts",
  "List AWS accounts integrated with Datadog",
  {
    aws_account_id: z.string().optional().describe("Filter by AWS account ID"),
  },
  async (args) => {
    const result = await listAWSAccounts.execute(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_network_devices",
  "List network devices monitored by Datadog NDM with filtering and pagination",
  {
    page_size: z.number().optional(),
    page_number: z.number().optional(),
    filter_tag: z.string().optional(),
    sort: z.string().optional(),
  },
  async (params) => {
    const result = await listNetworkDevices.execute(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "get_csm_coverage",
  "Get Cloud Security Management coverage across cloud accounts",
  {
    page_size: z.number().optional(),
    page_cursor: z.string().optional(),
  },
  async (params) => {
    const result = await getCSMCoverage.execute(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "search_incidents",
  "Search Datadog incidents with advanced filtering by severity, status, and time range",
  {
    query: z.string(),
    filter_created_start: z.string().optional(),
    filter_created_end: z.string().optional(),
    page_size: z.number().optional(),
    page_offset: z.number().optional(),
    sort: z.string().optional(),
  },
  async (params) => {
    const result = await searchIncidents.execute(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_cost_budgets",
  "List cloud cost management budgets for tracking team spending",
  {
    page_size: z.number().optional(),
    page_offset: z.number().optional(),
  },
  async (params) => {
    const result = await listCostBudgets.execute(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_vulnerabilities",
  "List security vulnerability findings with filtering by type, severity, and status",
  {
    page_size: z.number().optional(),
    page_cursor: z.string().optional(),
    filter_type: z.string().optional(),
    filter_severity: z.string().optional(),
    filter_status: z.string().optional(),
  },
  async (params) => {
    const result = await listVulnerabilities.execute(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "aggregate_network_connections",
  "Aggregate network connection analytics with grouping and filtering",
  {
    filter_from: z.string().optional(),
    filter_to: z.string().optional(),
    filter_query: z.string().optional(),
    group_by: z.array(z.string()).optional(),
    aggregate: z.string().optional(),
  },
  async (params) => {
    const result = await aggregateNetworkConnections.execute(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_workflows",
  "List Datadog workflow automations for incident response and remediation",
  {
    page_size: z.number().optional(),
    page_number: z.number().optional(),
    filter_name: z.string().optional(),
  },
  async (params) => {
    const result = await listWorkflows.execute(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_monitor_notification_rules",
  "List monitor notification routing rules showing who gets alerted",
  {
    page_size: z.number().optional(),
    page_offset: z.number().optional(),
  },
  async (params) => {
    const result = await listMonitorNotificationRules.execute(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "get_top_avg_metrics",
  "Get top custom metrics by average hourly count for cost and cardinality analysis",
  {
    month: z.string().optional(),
    day: z.string().optional(),
    names: z.array(z.string()).optional(),
    limit: z.number().optional(),
    next_record_id: z.string().optional(),
  },
  async (params) => {
    const result = await getTopAvgMetrics.execute(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_csm_threats_agent_rules",
  "List CSM Threats agent rules for workload security monitoring",
  {
    page_size: z.number().optional(),
    page_number: z.number().optional(),
  },
  async (params) => {
    const result = await listCSMThreatsAgentRules.execute(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_dora_deployments",
  "List DORA metric deployments for tracking deployment frequency and lead time",
  {
    filter_from: z.string().optional(),
    filter_to: z.string().optional(),
    filter_service: z.string().optional(),
    filter_env: z.string().optional(),
    page_size: z.number().optional(),
    page_cursor: z.string().optional(),
  },
  async (params) => {
    const result = await listDORADeployments.execute(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_fleet_agents",
  "List Datadog fleet agents with version, OS, and status information",
  {
    page_size: z.number().optional(),
    page_cursor: z.string().optional(),
    filter_query: z.string().optional(),
  },
  async (params) => {
    const result = await listFleetAgents.execute(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "get_slo_corrections",
  "List all SLO corrections (status adjustments) across your organization. Shows maintenance windows and planned downtime exclusions that affect SLO calculations.",
  {
    offset: z.number().optional(),
    limit: z.number().optional(),
  },
  async (params) => {
    const result = await getSLOCorrections.execute(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "get_ip_ranges",
  "Get Datadog IP ranges used by agents, APIs, APM, logs, process collection, synthetics, and webhooks. Useful for firewall/allowlist configuration.",
  {},
  async () => {
    const result = await getIPRanges.execute({} as Record<string, never>);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "get_logs_pipeline_order",
  "Get the ordered list of log pipeline IDs, showing the processing order for log pipelines.",
  {},
  async () => {
    const result = await getLogsPipelineOrder.execute({} as Record<string, never>);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "get_logs_archive_order",
  "Get the ordered list of log archive IDs, showing the priority order for log archiving.",
  {},
  async () => {
    const result = await getLogsArchiveOrder.execute({} as Record<string, never>);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "search_slos",
  "Search and filter SLOs by query string. Supports pagination and faceted search for finding specific SLOs by name, tags, or other attributes.",
  {
    query: z.string().optional(),
    page_size: z.number().optional(),
    page_number: z.number().optional(),
    include_facets: z.boolean().optional(),
  },
  async (params) => {
    const result = await searchSLOs.execute(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "get_estimated_cost",
  "Get estimated cost data for your Datadog usage. Filter by date range and view type (sub_org, summary). Useful for cost monitoring and budget planning.",
  {
    view: z.string().optional(),
    start_month: z.string().optional(),
    end_month: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
  },
  async (params) => {
    const result = await getEstimatedCost.execute(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_synthetics_global_variables",
  "List all Synthetics global variables used across synthetic tests for shared configuration like URLs, credentials, and test data.",
  {},
  async () => {
    const result = await listSyntheticsGlobalVariables.execute({} as Record<string, never>);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_downtime_schedules",
  "List scheduled downtimes (v2 API). Filter by current/upcoming schedules. Shows muted monitors, scopes, and schedule details.",
  {
    page_limit: z.number().optional(),
    page_offset: z.number().optional(),
    current_only: z.boolean().optional(),
  },
  async (params) => {
    const result = await listDowntimeSchedules.execute(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_spans_metrics",
  "List all span-based metrics (APM custom metrics) configured for generating metrics from APM spans.",
  {},
  async () => {
    const result = await listSpansMetrics.execute({} as Record<string, never>);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "get_monitor_config_policies",
  "Get monitor configuration policies that enforce tag and setting requirements on monitors across your organization.",
  {},
  async () => {
    const result = await getMonitorConfigPolicies.execute({} as Record<string, never>);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_synthetics_locations",
  "List available Synthetics testing locations (both managed by Datadog and private). Useful for configuring where synthetic tests run.",
  {},
  async () => {
    const result = await listSyntheticsLocations.execute({} as Record<string, never>);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_logs_metrics",
  "List all log-based metrics configured for generating custom metrics from log data.",
  {},
  async () => {
    const result = await listLogsMetrics.execute({} as Record<string, never>);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "get_organization",
  "Get your Datadog organization info including name, plan, public ID, and settings. Essential for understanding account configuration.",
  {},
  async () => {
    const result = await getOrganization.execute({} as Record<string, never>);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_host_totals",
  "Get the total number of active and up hosts in your Datadog account. Quick health check for infrastructure scale.",
  {},
  async () => {
    const result = await listHostTotals.execute({} as Record<string, never>);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_webhooks",
  "List all configured webhook integrations. Useful for auditing alert routing and notification channels.",
  {},
  async () => {
    const result = await listWebhooks.execute({} as Record<string, never>);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_synthetics_private_locations",
  "List Synthetics private locations for internal testing. Shows private location IDs, names, and tags.",
  {},
  async () => {
    const result = await listSyntheticsPrivateLocations.execute({} as Record<string, never>);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_security_monitoring_rules",
  "List security monitoring detection rules with pagination. Shows enabled/disabled rules, names, and types.",
  {
    page_size: z.number().optional(),
    page_number: z.number().optional(),
  },
  async (params) => {
    const result = await listSecurityMonitoringRules.execute(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "get_sensitive_data_scanner_config",
  "Get Sensitive Data Scanner configuration including scanning groups and rules for PII/sensitive data detection.",
  {},
  async () => {
    const result = await getSensitiveDataScannerConfig.execute({} as Record<string, never>);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "get_incident_services",
  "List incident services used for categorizing and routing incidents. Filter by name and paginate results.",
  {
    page_size: z.number().optional(),
    page_offset: z.number().optional(),
    filter: z.string().optional(),
  },
  async (params) => {
    const result = await getIncidentServices.execute(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_gcp_integration",
  "List Google Cloud Platform integration accounts connected to Datadog.",
  {},
  async () => {
    const result = await listGCPIntegration.execute({} as Record<string, never>);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_azure_integration",
  "List Azure integration accounts connected to Datadog.",
  {},
  async () => {
    const result = await listAzureIntegration.execute({} as Record<string, never>);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_cloudflare_accounts",
  "List Cloudflare accounts integrated with Datadog for monitoring CDN and edge performance.",
  {},
  async () => {
    const result = await listCloudflareAccounts.execute({} as Record<string, never>);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_restriction_policies",
  "Get restriction policy for a specific resource. Shows access control bindings and principals.",
  {
    resource_id: z.string(),
  },
  async (params) => {
    const result = await listRestrictionPolicies.execute(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_confluent_accounts",
  "List Confluent Cloud accounts integrated with Datadog for monitoring Kafka clusters.",
  {},
  async () => {
    const result = await listConfluentAccounts.execute({} as Record<string, never>);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

// Wave 8 tools
server.tool(
  "list_ci_tests",
  "List CI test events from Datadog CI Visibility. Filter by query, time range. Use for 'show failed tests', 'test results for service X'.",
  {
    filter_query: z.string().optional(),
    filter_from: z.string().optional(),
    filter_to: z.string().optional(),
    page_limit: z.number().optional(),
    page_cursor: z.string().optional(),
    sort: z.string().optional(),
  },
  async (params) => {
    const result = await listCITests.execute({
      filterQuery: params.filter_query,
      filterFrom: params.filter_from,
      filterTo: params.filter_to,
      pageLimit: params.page_limit,
      pageCursor: params.page_cursor,
      sort: params.sort,
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "search_ci_test_events",
  "Search CI test events with filters. Use for 'find flaky tests', 'test failures in last hour', 'test duration analysis'.",
  {
    filter: z
      .object({
        query: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
      })
      .optional(),
    sort: z.string().optional(),
    page: z
      .object({
        limit: z.number().optional(),
        cursor: z.string().optional(),
      })
      .optional(),
  },
  async (params) => {
    const result = await getCITestEvents.execute(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "get_incident_timeline",
  "Get timeline events for a Datadog incident. Shows status changes, messages, tasks, notifications.",
  {
    incident_id: z.string(),
    page_size: z.number().optional(),
    page_offset: z.number().optional(),
    filter_type: z.string().optional(),
  },
  async (params) => {
    const result = await getIncidentTimeline.execute({
      incidentId: params.incident_id,
      pageSize: params.page_size,
      pageOffset: params.page_offset,
      filterType: params.filter_type,
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_team_members",
  "List members of a Datadog team. Shows user roles and membership details.",
  {
    team_id: z.string(),
    page_size: z.number().optional(),
    page_number: z.number().optional(),
    sort: z.string().optional(),
    filter_keyword: z.string().optional(),
  },
  async (params) => {
    const result = await listTeamMembers.execute({
      teamId: params.team_id,
      pageSize: params.page_size,
      pageNumber: params.page_number,
      sort: params.sort,
      filterKeyword: params.filter_keyword,
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_app_keys",
  "List application keys for the current user. Shows key names, scopes, and creation dates.",
  {
    page_size: z.number().optional(),
    page_number: z.number().optional(),
    sort: z.string().optional(),
    filter_name: z.string().optional(),
  },
  async (params) => {
    const result = await listAppKeys.execute({
      pageSize: params.page_size,
      pageNumber: params.page_number,
      sort: params.sort,
      filterName: params.filter_name,
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "get_metric_tag_config",
  "Get tag configuration for a specific metric. Shows which tags are indexed and queryable.",
  {
    metric_name: z.string(),
  },
  async (params) => {
    const result = await getMetricTagConfig.execute({
      metricName: params.metric_name,
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_metric_tag_configs",
  "List metric tag configurations. Filter by configured status, tags, activity window.",
  {
    filter_configured: z.boolean().optional(),
    filter_tags_configured: z.string().optional(),
    filter_metric: z.string().optional(),
    filter_active_within: z.number().optional(),
    window_seconds: z.number().optional(),
    page_size: z.number().optional(),
    page_cursor: z.string().optional(),
  },
  async (params) => {
    const result = await listMetricTagConfigs.execute({
      filterConfigured: params.filter_configured,
      filterTagsConfigured: params.filter_tags_configured,
      filterMetric: params.filter_metric,
      filterActiveWithin: params.filter_active_within,
      windowSeconds: params.window_seconds,
      pageSize: params.page_size,
      pageCursor: params.page_cursor,
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_authn_mappings",
  "List authentication mappings (SAML/OIDC). Shows how identity provider attributes map to Datadog roles.",
  {
    page_size: z.number().optional(),
    page_number: z.number().optional(),
    sort: z.string().optional(),
    filter_query: z.string().optional(),
  },
  async (params) => {
    const result = await listAuthNMappings.execute({
      pageSize: params.page_size,
      pageNumber: params.page_number,
      sort: params.sort,
      filterQuery: params.filter_query,
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_workflow_executions",
  "List execution instances for a Datadog workflow. Shows run history, status, and timing.",
  {
    workflow_id: z.string(),
    page_size: z.number().optional(),
    page_number: z.number().optional(),
  },
  async (params) => {
    const result = await listWorkflowExecutions.execute({
      workflowId: params.workflow_id,
      pageSize: params.page_size,
      pageNumber: params.page_number,
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "get_dbm_query_metrics",
  "Get Database Monitoring query metrics. Filter by database type, host, query text, and time range.",
  {
    filter_db_type: z.string().optional(),
    filter_host: z.string().optional(),
    filter_query: z.string().optional(),
    filter_from: z.string().optional(),
    filter_to: z.string().optional(),
    page_limit: z.number().optional(),
    page_cursor: z.string().optional(),
  },
  async (params) => {
    const result = await getDbmQueryMetrics.execute({
      filterDbType: params.filter_db_type,
      filterHost: params.filter_host,
      filterQuery: params.filter_query,
      filterFrom: params.filter_from,
      filterTo: params.filter_to,
      pageLimit: params.page_limit,
      pageCursor: params.page_cursor,
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
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

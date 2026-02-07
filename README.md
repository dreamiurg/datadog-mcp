# Datadog MCP Server

[![CI](https://github.com/dreamiurg/datadog-mcp-server/actions/workflows/ci.yml/badge.svg)](https://github.com/dreamiurg/datadog-mcp-server/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/dreamiurg/datadog-mcp-server/graph/badge.svg)](https://codecov.io/gh/dreamiurg/datadog-mcp-server)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/dreamiurg/datadog-mcp-server/badge)](https://scorecard.dev/viewer/?uri=github.com/dreamiurg/datadog-mcp-server)

> **The Datadog MCP server your AI deserves.** 106 read-only tools. Every observability pillar. Zero writes. Zero regrets.

---

## Why This One?

Look, we get it. You searched "datadog mcp server" and got seven results. You're wondering which one to pick. Let us save you some time.

| Feature | **Us (106 tools)** | Next Best (29 tools) | The Others (3-13 tools) |
|---------|:-----------------:|:-------------------:|:----------------------:|
| Logs (search + aggregate + pipelines + indexes) | **7 tools** | 1 tool | 0-1 tool |
| APM (traces, spans, services, dependencies) | **7 tools** | 1 tool | 0 tools |
| RUM (events, apps, aggregation) | **3 tools** | 3 tools | 0 tools |
| Monitors (list, get, search) | **4 tools** | 1 tool | 0-1 tool |
| Dashboards (get, list, collections) | **3 tools** | 1 tool | 0-1 tool |
| SLOs (list, get, history) | **5 tools** | 0 tools | 0-1 tool |
| Synthetics (tests, results, locations) | **5 tools** | 0 tools | 0-1 tool |
| Security (findings, posture, signals, rules, scanning) | **10 tools** | 0 tools | 0-1 tool |
| Infrastructure (hosts, tags, containers, processes) | **8 tools** | 2 tools | 0-1 tool |
| Service Catalog | **2 tools** | 0 tools | 0-1 tool |
| CI Visibility | **2 tools** | 0 tools | 0-1 tool |
| Organization | **3 tools** | 0 tools | 0-1 tool |
| Metrics (query, metadata, volumes, list) | **4 tools** | 1 tool | 0-1 tool |
| Error Tracking | **2 tools** | 0 tools | 0 tools |
| Database Monitoring | **1 tool** | 0 tools | 0 tools |
| Audit Trail | **2 tools** | 0 tools | 0 tools |
| Usage & Billing | **4 tools** | 0 tools | 0 tools |
| Notebooks | **3 tools** | 0 tools | 0 tools |
| Events & Incidents | **6 tools** | 2 tools | 0-1 tool |
| Downtimes | **2 tools** | 1 tool | 0-1 tool |
| Network Monitoring | **2 tools** | 0 tools | 0 tools |
| Cloud Cost Management | **1 tool** | 0 tools | 0 tools |
| DORA Metrics | **1 tool** | 0 tools | 0 tools |
| Workflows & Automation | **1 tool** | 0 tools | 0 tools |
| Fleet Management | **1 tool** | 0 tools | 0 tools |
| Cloud Integrations (AWS/GCP/Azure/Cloudflare/Confluent) | **5 tools** | 0 tools | 0 tools |
| Webhooks | **1 tool** | 0 tools | 0 tools |
| Access Control | **1 tool** | 0 tools | 0 tools |
| API Key Management | **1 tool** | 0 tools | 0 tools |
| Monitor Notifications | **1 tool** | 0 tools | 0 tools |
| IP Ranges & Config | **1 tool** | 0 tools | 0 tools |
| **Total** | **106** | **20** | **3-13** |
| Accidentally deletes your monitors | No | No | No |
| Can mute your hosts at 3 AM | **No** | Yes | No |
| Test coverage | 90%+ | Unknown | Hopeful |

We're not saying the other MCP servers are bad. They're lovely. Some of them have features we don't, like the ability to *mute your production hosts* and *schedule downtimes* from an AI chat window. We chose not to include those. On purpose. You're welcome.

### The Philosophy

**Read everything. Write nothing.**

Your AI assistant should be able to *see* all of Datadog. It should *not* be able to silence your pager at 3 AM because it decided your alerts were "probably fine." We have opinions about this.

---

## Quick Start

```bash
npx github:dreamiurg/datadog-mcp-server --help
```

**That's it.** No installation required. Node.js 20+. Works in 8 seconds. We timed it.

---

## Setup

### 1. Get Datadog Credentials

You need two keys from your [Datadog Organization Settings](https://app.datadoghq.com/organization-settings/):

| Credential | Where to Find | Difficulty |
|------------|---------------|-----------|
| **API Key** | Organization Settings -> API Keys -> New Key | Easy |
| **Application Key** | Organization Settings -> Application Keys -> New Key | Also easy |

> **Tip:** For least-privilege access, [scope your Application Key](#application-key-scopes) to only the permissions you need. Or give it everything. We won't judge. (We will judge a little.)

### 2. Configure Your AI Tool

<details>
<summary><strong>Claude Code (CLI)</strong></summary>

```bash
claude mcp add datadog -- npx github:dreamiurg/datadog-mcp-server \
  --apiKey YOUR_API_KEY \
  --appKey YOUR_APP_KEY \
  --site datadoghq.com
```

Or add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "datadog": {
      "command": "npx",
      "args": ["github:dreamiurg/datadog-mcp-server", "--apiKey", "YOUR_API_KEY", "--appKey", "YOUR_APP_KEY"]
    }
  }
}
```
</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

Add to your config file:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "datadog": {
      "command": "npx",
      "args": ["github:dreamiurg/datadog-mcp-server", "--apiKey", "YOUR_API_KEY", "--appKey", "YOUR_APP_KEY"]
    }
  }
}
```
</details>

<details>
<summary><strong>Cursor / VS Code / Windsurf</strong></summary>

| Tool | Config File |
|------|-------------|
| Cursor | `~/.cursor/mcp.json` or `.cursor/mcp.json` (project) |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` |
| VS Code | User Settings JSON (`Ctrl+Shift+P` -> "Open User Settings (JSON)") |

```json
{
  "mcpServers": {
    "datadog": {
      "command": "npx",
      "args": ["github:dreamiurg/datadog-mcp-server", "--apiKey", "YOUR_API_KEY", "--appKey", "YOUR_APP_KEY"]
    }
  }
}
```
</details>

<details>
<summary><strong>Gemini CLI</strong></summary>

Add to `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "datadog": {
      "command": "npx",
      "args": ["github:dreamiurg/datadog-mcp-server", "--apiKey", "YOUR_API_KEY", "--appKey", "YOUR_APP_KEY"]
    }
  }
}
```
</details>

<details>
<summary><strong>Codex CLI (OpenAI)</strong></summary>

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.datadog]
command = "npx"
args = ["github:dreamiurg/datadog-mcp-server", "--apiKey", "YOUR_API_KEY", "--appKey", "YOUR_APP_KEY"]
```
</details>

---

## The Full Arsenal (106 Tools)

### Logs & Log Management

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `search-logs` | Search logs with Datadog query syntax | *"Find errors in auth service last hour"* |
| `aggregate-logs` | Compute counts, averages, group-bys on log data | *"Count errors by service in the last 24h"* |
| `get-log-pipelines` | List log pipeline configurations | *"How are our logs being processed?"* |
| `get-log-indexes` | List log indexes and retention settings | *"What retention is configured for our logs?"* |
| `get-logs-pipeline-order` | Get log pipeline processing order | *"What order do log pipelines execute in?"* |
| `get-logs-archive-order` | Get log archive priority order | *"Which archives are checked first for rehydration?"* |
| `list-logs-metrics` | List log-based custom metrics | *"What metrics are generated from logs?"* |

### APM & Traces

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `search-spans` | Search APM spans with query syntax | *"Find slow requests in payment service"* |
| `aggregate-spans` | Compute APM statistics (p99, error rates) | *"Show p99 latency by service"* |
| `get-services` | List APM-instrumented services | *"What services are being traced?"* |
| `get-trace` | Get a full distributed trace by ID | *"Show all spans for trace abc123"* |
| `search-apm-events` | Search raw APM events | *"Find APM events with errors in checkout"* |
| `list-active-apm-events` | List currently active APM events | *"What APM events are happening right now?"* |
| `list-spans-metrics` | List span-based APM metrics | *"What custom span metrics are configured?"* |

### Metrics

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `query-metrics` | Query timeseries metric data | *"Show CPU usage for web hosts last 4 hours"* |
| `get-metrics` | List available metrics | *"What metrics are available?"* |
| `get-metric-metadata` | Get metric metadata and descriptions | *"Describe the system.cpu.user metric"* |
| `search-metric-volumes` | Search metrics by name with volume data | *"Which metrics matching 'aws.*' have the highest volume?"* |

### Monitors & Alerting

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `get-monitors` | List monitors (filter by state, tags) | *"Show all alerting monitors"* |
| `get-monitor` | Get monitor details by ID | *"Get details for monitor 12345"* |
| `search-monitors` | Search monitors by query | *"Find monitors related to database"* |
| `get-monitor-config-policies` | Get monitor configuration policies | *"What monitor config policies are enforced?"* |

### Dashboards

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `get-dashboards` | List all dashboards | *"What dashboards do we have?"* |
| `get-dashboard` | Get dashboard details and widgets | *"Show the API metrics dashboard"* |
| `list-dashboard-lists` | List dashboard collections | *"What dashboard lists are organized?"* |

### SLOs

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `get-slos` | List Service Level Objectives | *"Which SLOs are breaching?"* |
| `get-slo` | Get SLO details by ID | *"Show error budget for SLO xyz"* |
| `get-slo-history` | Get historical SLO performance | *"How has our API SLO trended this month?"* |
| `get-slo-corrections` | List SLO correction periods | *"What SLO corrections have been applied?"* |
| `search-slos` | Search SLOs with query filters | *"Find all SLOs with error budget below 10%"* |

### Synthetics

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `get-synthetic-tests` | List synthetic tests | *"What synthetic checks do we have?"* |
| `get-synthetic-results` | Get results for a specific test | *"Show recent results for the checkout test"* |
| `list-synthetics-global-variables` | List Synthetics global variables | *"What global variables are available for tests?"* |
| `list-synthetics-locations` | List available Synthetics testing locations | *"Where can I run Synthetics tests from?"* |
| `list-synthetics-private-locations` | List Synthetics private locations | *"What private locations are configured for testing?"* |

### Real User Monitoring (RUM)

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `search-rum-events` | Search RUM events with filters | *"Find RUM errors on the checkout page"* |
| `list-rum-applications` | List registered RUM applications | *"What apps have RUM enabled?"* |
| `aggregate-rum-events` | Analytics on RUM data (counts, averages, group-by) | *"Average page load time by country"* |

### Infrastructure

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `get-hosts` | List infrastructure hosts | *"Show all production hosts"* |
| `get-host-tags` | Get tags for all hosts | *"What tags are on our hosts?"* |
| `get-active-hosts-count` | Get total active/up host count | *"How many hosts are running?"* |
| `list-host-totals` | Get total active and up host counts | *"Show me the total host count breakdown"* |
| `list-network-devices` | List NDM network devices | *"Show network device status"* |
| `list-fleet-agents` | List Datadog agents across fleet | *"Which agents are outdated?"* |
| `get-containers` | List running containers | *"Show containers filtered by image"* |
| `list-processes` | List running processes | *"Find java processes across hosts"* |

### Service Catalog

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `list-service-definitions` | List all service definitions | *"What services are in the catalog?"* |
| `get-service-definition` | Get a single service definition | *"Who owns the auth service?"* |
| `get-service-dependencies` | Get service dependency map | *"What does the payment service depend on?"* |

### CI Visibility

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `list-ci-pipelines` | List CI pipeline events | *"Show recent CI pipeline runs"* |
| `get-ci-pipeline-events` | Aggregate CI pipeline analytics | *"Average pipeline duration by repo"* |

### Security

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `search-security-findings` | Search Cloud Security findings | *"Find high-severity security findings"* |
| `get-security-finding` | Get a specific security finding | *"Get finding abc123"* |
| `list-posture-findings` | List compliance/posture findings | *"Show failed compliance checks"* |
| `search-security-signals` | Search security monitoring signals | *"Recent threat detections"* |
| `get-csm-coverage` | Get CSM coverage across cloud accounts | *"Which AWS accounts lack security coverage?"* |
| `list-vulnerabilities` | List vulnerability findings | *"Show critical CVEs in production"* |
| `list-csm-threats-agent-rules` | List CSM Threats agent rules | *"What workload security rules are enabled?"* |
| `list-security-rules` | List security monitoring rules | *"What detection rules are active?"* |
| `list-security-monitoring-rules` | List security monitoring detection rules | *"What security detection rules are configured?"* |
| `get-sensitive-data-scanner-config` | Get Sensitive Data Scanner configuration | *"What sensitive data scanning rules are active?"* |

### Organization

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `get-organization` | Get Datadog organization info | *"Show organization details and settings"* |
| `list-teams` | List Datadog teams | *"What teams exist in our org?"* |
| `list-users` | List Datadog users | *"Who has access to Datadog?"* |

### Everything Else

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `get-events` | Fetch events in a time range | *"What events happened today?"* |
| `get-downtimes` | List scheduled maintenance | *"Any active downtimes?"* |
| `list-downtime-schedules` | List scheduled downtimes (v2) | *"What downtimes are scheduled?"* |
| `get-dbm-samples` | Get Database Monitoring query samples | *"Show slow postgres queries"* |
| `get-ip-ranges` | Get Datadog IP ranges for firewall config | *"What IPs should I allowlist for Datadog?"* |

### Audit & Usage

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `search-audit-logs` | Search audit trail with filters | *"Who changed configs in the last hour?"* |
| `get-hourly-usage` | Get hourly usage metering by product | *"Show log ingestion usage trends"* |
| `get-top-avg-metrics` | Get top custom metrics by hourly average | *"Which custom metrics drive cardinality costs?"* |
| `get-estimated-cost` | Get estimated usage cost data | *"What's our projected Datadog bill this month?"* |

### Notebooks

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `list-notebooks` | List Datadog notebooks with filtering | *"Find investigation notebooks"* |
| `get-notebook` | Get a specific notebook by ID | *"Show notebook 12345"* |

### Containers & Processes

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `list-containers` | List containers with tag filtering | *"Show running containers in us-east-1"* |
| `list-processes` | List processes across hosts | *"Find Java processes with high memory"* |

### Network Monitoring

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `list-network-devices` | List NDM network devices | *"Show network device status"* |
| `aggregate-network-connections` | Aggregate network flow analytics | *"Top network flows by bandwidth"* |

### Security & Compliance

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `list-security-rules` | List security monitoring rules | *"What detection rules are active?"* |
| `search-error-tracking-issues` | Search error tracking issues | *"Top errors by volume in production"* |
| `get-csm-coverage` | Get CSM coverage across cloud accounts | *"Which AWS accounts lack security coverage?"* |
| `list-vulnerabilities` | List vulnerability findings | *"Show critical CVEs in production"* |
| `list-csm-threats-agent-rules` | List CSM Threats agent rules | *"What workload security rules are enabled?"* |

### Incidents

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `search-incidents` | Search incidents with advanced filters | *"Find P1 incidents related to database"* |
| `get-incident-todos` | Get action items for an incident | *"What's pending for this P0?"* |
| `get-incident-services` | List incident services | *"What services are configured for incident management?"* |

### Cloud & Integrations

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `list-aws-accounts` | List integrated AWS accounts | *"Which AWS accounts are connected?"* |
| `list-gcp-integration` | List GCP integration accounts | *"Which GCP projects are integrated?"* |
| `list-azure-integration` | List Azure integration accounts | *"Which Azure subscriptions are connected?"* |
| `list-cloudflare-accounts` | List Cloudflare accounts | *"What Cloudflare accounts are integrated?"* |
| `list-confluent-accounts` | List Confluent Cloud accounts | *"Which Confluent Cloud accounts are connected?"* |
| `list-webhooks` | List webhook integrations | *"What webhooks are configured?"* |
| `list-api-keys` | List Datadog API keys | *"What API keys are active?"* |

### DevOps & Automation

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `list-dora-deployments` | List DORA deployment events | *"Show deployment frequency for web service"* |
| `list-workflows` | List workflow automations | *"What incident response workflows exist?"* |
| `list-fleet-agents` | List Datadog agents across fleet | *"Which agents are outdated?"* |
| `list-monitor-notification-rules` | List monitor notification routing | *"Who gets alerted for this monitor?"* |
| `list-cost-budgets` | List cloud cost budgets | *"Are any teams over budget?"* |

### Access Control

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `list-restriction-policies` | Get restriction policy for a resource | *"What access restrictions are configured?"* |

---

## The Competitive Landscape (We Did the Research So You Don't Have To)

There are approximately seven thousand Datadog MCP servers on GitHub. Here's how they stack up:

| Capability | **Us** | winor30 | GeLi2001 | shelfio | ppandrangi |
|-----------|:------:|:-------:|:--------:|:-------:|:---------:|
| Total tools | **106** | 20 | 10 | 13 | 29 |
| Read-only by design | Yes | No | Yes | Yes | No |
| Can mute your hosts | No | **Yes** | No | No | No |
| Can delete your dashboards | No | No | No | No | **Yes** |
| Can schedule downtimes | No | **Yes** | No | No | **Yes** |
| Test suite | 480 tests | - | - | - | - |
| Last meaningful update | Today | Recent | Dec 2025 | Jan 2026 | Dec 2025 |

> **A note on write operations:** Some competitors let your AI create monitors, delete dashboards, and schedule downtimes. That's a feature. It's also the plot of every "AI gone wrong" movie. We chose the boring path: read everything, touch nothing.

### What They Have That We Don't

In the interest of full transparency:

- **winor30** can mute/unmute hosts and schedule downtimes (write operations we intentionally excluded)
- **ppandrangi** can CRUD monitors and dashboards (see above re: AI movies)
- **shelfio** has some unique metric field exploration tools

We sleep well at night.

---

## Configuration Reference

### Regional Endpoints

Set `--site` for your Datadog region:

| Region | Site Value |
|--------|------------|
| US (default) | `datadoghq.com` |
| EU | `datadoghq.eu` |
| US3 (GovCloud) | `ddog-gov.com` |
| US5 | `us5.datadoghq.com` |
| AP1 | `ap1.datadoghq.com` |

### Environment Variables

Alternative to command-line arguments:

```bash
DD_API_KEY=your_api_key
DD_APP_KEY=your_app_key
DD_SITE=datadoghq.com          # Optional, defaults to datadoghq.com
DD_LOGS_SITE=logs.datadoghq.com # Optional, override for logs API
DD_METRICS_SITE=api.datadoghq.com # Optional, override for metrics API
```

### Logging

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `LOG_LEVEL` | `debug`, `info`, `warn`, `error` | `info` | Minimum log level |
| `LOG_FORMAT` | `json`, `pretty` | `json` | Output format (`pretty` for local dev) |

```bash
# Pretty logs for development
LOG_FORMAT=pretty npx github:dreamiurg/datadog-mcp-server --apiKey ... --appKey ...
```

---

## Application Key Scopes

For least-privilege security, create an Application Key with only required scopes:

| Tools | Required Scope |
|-------|----------------|
| Monitors (`get-monitors`, `get-monitor`, `search-monitors`) | `monitors_read` |
| Dashboards (`get-dashboards`, `get-dashboard`, `list-dashboard-lists`) | `dashboards_read` |
| Metrics (`get-metrics`, `get-metric-metadata`, `query-metrics`, `search-metric-volumes`) | `metrics_read` |
| Events (`get-events`) | `events_read` |
| Logs (`search-logs`, `aggregate-logs`, `get-log-pipelines`, `get-log-indexes`) | `logs_read_data` |
| Incidents (`search-incidents`, `get-incident-todos`) | `incident_read` |
| Hosts (`get-hosts`, `get-host-tags`, `get-active-hosts-count`) | `hosts_read` |
| Containers (`list-containers`) | `containers_read` |
| Downtimes (`get-downtimes`) | `monitors_downtime` |
| SLOs (`get-slos`, `get-slo`, `get-slo-history`) | `slos_read` |
| APM (`search-spans`, `aggregate-spans`, `get-trace`, `search-apm-events`, `list-active-apm-events`) | `apm_read` |
| Services (`get-services`, `get-service-dependencies`) | `apm_service_catalog_read` |
| Service Catalog (`list-service-definitions`, `get-service-definition`) | `apm_service_catalog_read` |
| RUM (`search-rum-events`, `list-rum-applications`, `aggregate-rum-events`) | `rum_read` |
| Synthetics (`get-synthetic-tests`, `get-synthetic-results`) | `synthetics_read` |
| Security (`search-security-findings`, `get-security-finding`, `list-posture-findings`, `search-security-signals`) | `security_monitoring_findings_read` |
| Security Rules (`list-security-rules`) | `security_monitoring_rules_read` |
| CSM (`get-csm-coverage`, `list-csm-threats-agent-rules`) | `csm_agents_read` |
| Vulnerabilities (`list-vulnerabilities`) | `security_monitoring_findings_read` |
| Teams (`list-teams`) | `teams_read` |
| Users (`list-users`) | `user_access_read` |
| Notebooks (`list-notebooks`, `get-notebook`) | `notebooks_read` |
| CI Visibility (`list-ci-pipelines`, `get-ci-pipeline-events`) | `ci_visibility_pipelines_read` |
| Error Tracking (`search-error-tracking-issues`) | `error_tracking_read` |
| Audit (`search-audit-logs`) | `audit_trail_read` |
| DBM (`get-dbm-samples`) | `dbm_read` |
| Usage (`get-hourly-usage`, `get-top-avg-metrics`) | `usage_read` |
| Network (`list-network-devices`, `aggregate-network-connections`) | `ndm_read` |
| AWS Integration (`list-aws-accounts`) | `aws_configuration_read` |
| API Keys (`list-api-keys`) | `api_keys_read` |
| DORA (`list-dora-deployments`) | `dora_deployment_read` |
| Workflows (`list-workflows`) | `workflows_read` |
| Fleet (`list-fleet-agents`) | `fleet_read` |
| Cost (`list-cost-budgets`) | `cost_management_read` |
| Monitor Notifications (`list-monitor-notification-rules`) | `monitors_read` |

**Create a scoped key:** Organization Settings -> Application Keys -> New Key -> Select scopes

---

## Troubleshooting

<details>
<summary><strong>403 Forbidden</strong></summary>

1. Verify API key and Application key are correct
2. Check your Application Key has required [scopes](#application-key-scopes)
3. Confirm you're using the correct [regional endpoint](#regional-endpoints)
</details>

<details>
<summary><strong>Connection Issues</strong></summary>

```bash
# Check MCP server status
claude mcp list

# View logs (Claude Desktop - macOS)
tail -f ~/Library/Logs/Claude/mcp*.log

# View logs (Claude Desktop - Windows)
Get-Content "$env:APPDATA\Claude\Logs\mcp*.log" -Tail 20 -Wait
```
</details>

<details>
<summary><strong>Debug Mode</strong></summary>

```bash
LOG_LEVEL=debug LOG_FORMAT=pretty npx github:dreamiurg/datadog-mcp-server --apiKey ... --appKey ...
```
</details>

---

## Development

```bash
git clone https://github.com/dreamiurg/datadog-mcp-server.git
cd datadog-mcp-server
npm install
npm run build
npm test
```

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript |
| `npm test` | Run tests (480 tests in 96 files) |
| `npm run test:coverage` | Run tests with coverage (90%+ enforced) |
| `npm run lint` | Run Biome linter |
| `npm run typecheck` | Type check |
| `npm run complexity` | Check cyclomatic complexity |
| `npm run ci` | Run everything (the full gauntlet) |

### Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js \
  --apiKey=YOUR_API_KEY \
  --appKey=YOUR_APP_KEY
```

---

## Contributing

PRs welcome. We have strong opinions about read-only access, 90% test coverage, and cognitive complexity under 15. If that sounds like fun, you'll fit right in.

---

## License

[MIT](LICENSE) - Use freely in personal and commercial projects.

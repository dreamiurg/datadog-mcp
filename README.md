# Datadog MCP Server

[![CI](https://github.com/dreamiurg/datadog-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/dreamiurg/datadog-mcp/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/dreamiurg/datadog-mcp/graph/badge.svg)](https://codecov.io/gh/dreamiurg/datadog-mcp)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/dreamiurg/datadog-mcp/badge)](https://scorecard.dev/viewer/?uri=github.com/dreamiurg/datadog-mcp)

> **The Datadog MCP server your AI deserves.** 116 read-only tools. Every observability pillar. Zero writes. Zero regrets.

---

## Why This One?

Look, we get it. You searched "datadog mcp server" and got seven results. You're wondering which one to pick. Let us save you approximately forty-five seconds of reading other READMEs that say "supports monitors and dashboards" like that's supposed to impress someone.

| Feature | **Us (116 tools)** | Project 1 | Project 2 | Project 3 |
|---------|:-----------------:|:-------------------:|:----------------------:|:----------------------:|
| | | | | |
| **Observability Core** | | | | |
| Logs (search + aggregate + pipelines + indexes) | **7 tools** | 1 tool | 0-1 tool | 0-1 tool |
| APM (traces, spans, services, dependencies) | **7 tools** | 1 tool | 0 tools | 0 tools |
| Metrics (query, metadata, volumes, tags) | **6 tools** | 1 tool | 0-1 tool | 0 tools |
| RUM (events, apps, aggregation) | **3 tools** | 3 tools | 0 tools | 0 tools |
| | | | | |
| **Alerting & Reliability** | | | | |
| Monitors (list, get, search) | **4 tools** | 1 tool | 0-1 tool | 0-1 tool |
| Dashboards (get, list, collections) | **3 tools** | 1 tool | 0-1 tool | 0-1 tool |
| SLOs (list, get, history, search, corrections) | **5 tools** | 0 tools | 0-1 tool | 0-1 tool |
| Synthetics (tests, results, locations) | **5 tools** | 0 tools | 0-1 tool | 0 tools |
| Events & Incidents | **7 tools** | 2 tools | 0-1 tool | 0 tools |
| Downtimes | **2 tools** | 1 tool | 0-1 tool | 0 tools |
| | | | | |
| **Infrastructure & Security** | | | | |
| Infrastructure (hosts, tags, containers, processes) | **8 tools** | 2 tools | 0-1 tool | 0-1 tool |
| Security (findings, posture, signals, rules, scanning) | **10 tools** | 0 tools | 0-1 tool | 0 tools |
| Network Monitoring | **2 tools** | 0 tools | 0 tools | 0 tools |
| Cloud Integrations (AWS/GCP/Azure/Cloudflare/Confluent) | **5 tools** | 0 tools | 0 tools | 0 tools |
| | | | | |
| **Platform & DevOps** | | | | |
| Service Catalog | **3 tools** | 0 tools | 0-1 tool | 0 tools |
| CI Visibility (pipelines + tests) | **4 tools** | 0 tools | 0-1 tool | 0 tools |
| Organization (teams, users, auth) | **5 tools** | 0 tools | 0-1 tool | 0 tools |
| Error Tracking | **2 tools** | 0 tools | 0 tools | 0 tools |
| Database Monitoring | **2 tools** | 0 tools | 0 tools | 0 tools |
| Workflows & Automation | **2 tools** | 0 tools | 0 tools | 0 tools |
| DORA Metrics | **1 tool** | 0 tools | 0 tools | 0 tools |
| | | | | |
| **Governance & Cost** | | | | |
| Audit Trail | **2 tools** | 0 tools | 0 tools | 0 tools |
| Usage & Billing | **4 tools** | 0 tools | 0 tools | 0 tools |
| Cloud Cost Management | **1 tool** | 0 tools | 0 tools | 0 tools |
| Access Control (keys, mappings, policies) | **4 tools** | 0 tools | 0 tools | 0 tools |
| Notebooks | **3 tools** | 0 tools | 0 tools | 0 tools |
| Fleet Management | **1 tool** | 0 tools | 0 tools | 0 tools |
| Webhooks | **1 tool** | 0 tools | 0 tools | 0 tools |
| Monitor Notifications | **1 tool** | 0 tools | 0 tools | 0 tools |
| IP Ranges & Config | **1 tool** | 0 tools | 0 tools | 0 tools |
| | | | | |
| **Total** | **116** | ~20 | ~13 | ~29 |
| Accidentally deletes your monitors | No | No | No | No |
| Can mute your hosts at 3 AM | **No** | No | No | Yes |
| Test coverage | 90%+ | Unknown | Unknown | Unknown |

We're not saying the other MCP servers are bad. That would be rude, and also legally questionable. They're all built by talented engineers who are contributing to open source and making the ecosystem better. Some of them have features we don't, like the ability to *write* to your Datadog account from an AI chat window. We chose not to include those. On purpose. You're welcome.

### The Philosophy

**Read everything. Write nothing.**

Your AI assistant should be able to *see* all of Datadog. It should *not* be able to silence your pager at 3 AM because it decided your alerts were "probably fine." That's not a hypothetical scenario. That's a Tuesday. We have opinions about this, and they are all correct.

---

## Quick Start

```bash
npx github:dreamiurg/datadog-mcp --help
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
claude mcp add datadog -- npx github:dreamiurg/datadog-mcp \
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
      "args": ["github:dreamiurg/datadog-mcp", "--apiKey", "YOUR_API_KEY", "--appKey", "YOUR_APP_KEY"]
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
      "args": ["github:dreamiurg/datadog-mcp", "--apiKey", "YOUR_API_KEY", "--appKey", "YOUR_APP_KEY"]
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
      "args": ["github:dreamiurg/datadog-mcp", "--apiKey", "YOUR_API_KEY", "--appKey", "YOUR_APP_KEY"]
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
      "args": ["github:dreamiurg/datadog-mcp", "--apiKey", "YOUR_API_KEY", "--appKey", "YOUR_APP_KEY"]
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
args = ["github:dreamiurg/datadog-mcp", "--apiKey", "YOUR_API_KEY", "--appKey", "YOUR_APP_KEY"]
```
</details>

---

## The Full Arsenal (116 Tools)

<details>
<summary><strong>Logs & Log Management</strong> (7 tools)</summary>

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `search-logs` | Search logs with Datadog query syntax | *"Find errors in auth service last hour"* |
| `aggregate-logs` | Compute counts, averages, group-bys on log data | *"Count errors by service in the last 24h"* |
| `get-log-pipelines` | List log pipeline configurations | *"How are our logs being processed?"* |
| `get-log-indexes` | List log indexes and retention settings | *"What retention is configured for our logs?"* |
| `get-logs-pipeline-order` | Get log pipeline processing order | *"What order do log pipelines execute in?"* |
| `get-logs-archive-order` | Get log archive priority order | *"Which archives are checked first for rehydration?"* |
| `list-logs-metrics` | List log-based custom metrics | *"What metrics are generated from logs?"* |

</details>

<details>
<summary><strong>APM & Traces</strong> (7 tools)</summary>

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `search-spans` | Search APM spans with query syntax | *"Find slow requests in payment service"* |
| `aggregate-spans` | Compute APM statistics (p99, error rates) | *"Show p99 latency by service"* |
| `get-services` | List APM-instrumented services | *"What services are being traced?"* |
| `get-trace` | Get a full distributed trace by ID | *"Show all spans for trace abc123"* |
| `search-apm-events` | Search raw APM events | *"Find APM events with errors in checkout"* |
| `list-active-apm-events` | List currently active APM events | *"What APM events are happening right now?"* |
| `list-spans-metrics` | List span-based APM metrics | *"What custom span metrics are configured?"* |

</details>

<details>
<summary><strong>Metrics</strong> (6 tools)</summary>

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `query-metrics` | Query timeseries metric data | *"Show CPU usage for web hosts last 4 hours"* |
| `get-metrics` | List available metrics | *"What metrics are available?"* |
| `get-metric-metadata` | Get metric metadata and descriptions | *"Describe the system.cpu.user metric"* |
| `search-metric-volumes` | Search metrics by name with volume data | *"Which metrics matching 'aws.*' have the highest volume?"* |
| `get-metric-tag-config` | Get tag configuration for a specific metric | *"What tags are indexed for system.cpu.user?"* |
| `list-metric-tag-configs` | List metric tag configurations | *"Which metrics have custom tag configurations?"* |

</details>

<details>
<summary><strong>Monitors & Alerting</strong> (4 tools)</summary>

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `get-monitors` | List monitors (filter by state, tags) | *"Show all alerting monitors"* |
| `get-monitor` | Get monitor details by ID | *"Get details for monitor 12345"* |
| `search-monitors` | Search monitors by query | *"Find monitors related to database"* |
| `get-monitor-config-policies` | Get monitor configuration policies | *"What monitor config policies are enforced?"* |

</details>

<details>
<summary><strong>Dashboards</strong> (3 tools)</summary>

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `get-dashboards` | List all dashboards | *"What dashboards do we have?"* |
| `get-dashboard` | Get dashboard details and widgets | *"Show the API metrics dashboard"* |
| `list-dashboard-lists` | List dashboard collections | *"What dashboard lists are organized?"* |

</details>

<details>
<summary><strong>SLOs</strong> (5 tools)</summary>

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `get-slos` | List Service Level Objectives | *"Which SLOs are breaching?"* |
| `get-slo` | Get SLO details by ID | *"Show error budget for SLO xyz"* |
| `get-slo-history` | Get historical SLO performance | *"How has our API SLO trended this month?"* |
| `get-slo-corrections` | List SLO correction periods | *"What SLO corrections have been applied?"* |
| `search-slos` | Search SLOs with query filters | *"Find all SLOs with error budget below 10%"* |

</details>

<details>
<summary><strong>Synthetics</strong> (5 tools)</summary>

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `get-synthetic-tests` | List synthetic tests | *"What synthetic checks do we have?"* |
| `get-synthetic-results` | Get results for a specific test | *"Show recent results for the checkout test"* |
| `list-synthetics-global-variables` | List Synthetics global variables | *"What global variables are available for tests?"* |
| `list-synthetics-locations` | List available Synthetics testing locations | *"Where can I run Synthetics tests from?"* |
| `list-synthetics-private-locations` | List Synthetics private locations | *"What private locations are configured for testing?"* |

</details>

<details>
<summary><strong>Real User Monitoring (RUM)</strong> (3 tools)</summary>

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `search-rum-events` | Search RUM events with filters | *"Find RUM errors on the checkout page"* |
| `list-rum-applications` | List registered RUM applications | *"What apps have RUM enabled?"* |
| `aggregate-rum-events` | Analytics on RUM data (counts, averages, group-by) | *"Average page load time by country"* |

</details>

<details>
<summary><strong>Infrastructure</strong> (8 tools)</summary>

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

</details>

<details>
<summary><strong>Service Catalog</strong> (3 tools)</summary>

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `list-service-definitions` | List all service definitions | *"What services are in the catalog?"* |
| `get-service-definition` | Get a single service definition | *"Who owns the auth service?"* |
| `get-service-dependencies` | Get service dependency map | *"What does the payment service depend on?"* |

</details>

<details>
<summary><strong>CI Visibility</strong> (4 tools)</summary>

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `list-ci-pipelines` | List CI pipeline events | *"Show recent CI pipeline runs"* |
| `get-ci-pipeline-events` | Aggregate CI pipeline analytics | *"Average pipeline duration by repo"* |
| `list-ci-tests` | List CI test events | *"Show failed tests in the last hour"* |
| `search-ci-test-events` | Search CI test events with filters | *"Find flaky tests in the checkout service"* |

</details>

<details>
<summary><strong>Security</strong> (10 tools)</summary>

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

</details>

<details>
<summary><strong>Organization</strong> (5 tools)</summary>

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `get-organization` | Get Datadog organization info | *"Show organization details and settings"* |
| `list-teams` | List Datadog teams | *"What teams exist in our org?"* |
| `list-team-members` | List members of a Datadog team | *"Who is on the platform team?"* |
| `list-users` | List Datadog users | *"Who has access to Datadog?"* |
| `list-authn-mappings` | List SAML/OIDC authentication mappings | *"How do IdP groups map to Datadog roles?"* |

</details>

<details>
<summary><strong>Events, Downtimes & Database Monitoring</strong> (6 tools)</summary>

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `get-events` | Fetch events in a time range | *"What events happened today?"* |
| `get-downtimes` | List scheduled maintenance | *"Any active downtimes?"* |
| `list-downtime-schedules` | List scheduled downtimes (v2) | *"What downtimes are scheduled?"* |
| `get-dbm-samples` | Get Database Monitoring query samples | *"Show slow postgres queries"* |
| `get-dbm-query-metrics` | Get Database Monitoring query metrics | *"Which queries have the highest latency?"* |
| `get-ip-ranges` | Get Datadog IP ranges for firewall config | *"What IPs should I allowlist for Datadog?"* |

</details>

<details>
<summary><strong>Audit & Usage</strong> (4 tools)</summary>

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `search-audit-logs` | Search audit trail with filters | *"Who changed configs in the last hour?"* |
| `get-hourly-usage` | Get hourly usage metering by product | *"Show log ingestion usage trends"* |
| `get-top-avg-metrics` | Get top custom metrics by hourly average | *"Which custom metrics drive cardinality costs?"* |
| `get-estimated-cost` | Get estimated usage cost data | *"What's our projected Datadog bill this month?"* |

</details>

<details>
<summary><strong>Notebooks</strong> (2 tools)</summary>

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `list-notebooks` | List Datadog notebooks with filtering | *"Find investigation notebooks"* |
| `get-notebook` | Get a specific notebook by ID | *"Show notebook 12345"* |

</details>

<details>
<summary><strong>Containers & Processes</strong> (2 tools)</summary>

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `list-containers` | List containers with tag filtering | *"Show running containers in us-east-1"* |
| `list-processes` | List processes across hosts | *"Find Java processes with high memory"* |

</details>

<details>
<summary><strong>Network Monitoring</strong> (2 tools)</summary>

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `list-network-devices` | List NDM network devices | *"Show network device status"* |
| `aggregate-network-connections` | Aggregate network flow analytics | *"Top network flows by bandwidth"* |

</details>

<details>
<summary><strong>Security & Compliance</strong> (5 tools)</summary>

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `list-security-rules` | List security monitoring rules | *"What detection rules are active?"* |
| `search-error-tracking-issues` | Search error tracking issues | *"Top errors by volume in production"* |
| `get-csm-coverage` | Get CSM coverage across cloud accounts | *"Which AWS accounts lack security coverage?"* |
| `list-vulnerabilities` | List vulnerability findings | *"Show critical CVEs in production"* |
| `list-csm-threats-agent-rules` | List CSM Threats agent rules | *"What workload security rules are enabled?"* |

</details>

<details>
<summary><strong>Incidents</strong> (4 tools)</summary>

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `search-incidents` | Search incidents with advanced filters | *"Find P1 incidents related to database"* |
| `get-incident-todos` | Get action items for an incident | *"What's pending for this P0?"* |
| `get-incident-timeline` | Get timeline events for an incident | *"Show the timeline for incident xyz"* |
| `get-incident-services` | List incident services | *"What services are configured for incident management?"* |

</details>

<details>
<summary><strong>Cloud & Integrations</strong> (7 tools)</summary>

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `list-aws-accounts` | List integrated AWS accounts | *"Which AWS accounts are connected?"* |
| `list-gcp-integration` | List GCP integration accounts | *"Which GCP projects are integrated?"* |
| `list-azure-integration` | List Azure integration accounts | *"Which Azure subscriptions are connected?"* |
| `list-cloudflare-accounts` | List Cloudflare accounts | *"What Cloudflare accounts are integrated?"* |
| `list-confluent-accounts` | List Confluent Cloud accounts | *"Which Confluent Cloud accounts are connected?"* |
| `list-webhooks` | List webhook integrations | *"What webhooks are configured?"* |
| `list-api-keys` | List Datadog API keys | *"What API keys are active?"* |

</details>

<details>
<summary><strong>DevOps & Automation</strong> (6 tools)</summary>

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `list-dora-deployments` | List DORA deployment events | *"Show deployment frequency for web service"* |
| `list-workflows` | List workflow automations | *"What incident response workflows exist?"* |
| `list-workflow-executions` | List execution instances for a workflow | *"Show run history for the incident workflow"* |
| `list-fleet-agents` | List Datadog agents across fleet | *"Which agents are outdated?"* |
| `list-monitor-notification-rules` | List monitor notification routing | *"Who gets alerted for this monitor?"* |
| `list-cost-budgets` | List cloud cost budgets | *"Are any teams over budget?"* |

</details>

<details>
<summary><strong>Access Control</strong> (3 tools)</summary>

| Tool | What It Does | Try Asking |
|------|-------------|------------|
| `list-restriction-policies` | Get restriction policy for a resource | *"What access restrictions are configured?"* |
| `list-app-keys` | List application keys for the current user | *"What application keys do I have?"* |
| `list-authn-mappings` | List authentication mappings | *"How do SAML groups map to Datadog roles?"* |

</details>

---

<details>
<summary><strong>The Competitive Landscape</strong> (We did the research so you don't have to)</summary>

There are approximately seven thousand Datadog MCP servers on GitHub. We counted. Then we lost count. Then we counted again. Here's how they stack up:

| Capability | **Us** | Project 1 | Project 2 | Project 3 | Project 4 |
|-----------|:------:|:-------:|:--------:|:-------:|:---------:|
| Total tools | **116** | ~20 | ~10 | ~13 | ~29 |
| Read-only by design | Yes | No | Yes | Yes | No |
| Can mute your hosts | No | **Yes** | No | No | No |
| Can delete your dashboards | No | No | No | No | **Yes** |
| Can schedule downtimes | No | **Yes** | No | No | **Yes** |
| Test suite | 570 tests | - | - | - | - |
| Last meaningful update | Today | Recent | Dec 2025 | Jan 2026 | Dec 2025 |

> **A note on write operations:** Some servers let your AI create monitors, delete dashboards, and schedule downtimes. That's a feature. It's also the plot of every "AI gone wrong" movie ever made. We chose the boring path: read everything, touch nothing. Our therapist says this is healthy.

### What They Have That We Don't

In the interest of full transparency (and because our lawyers said we had to):

- Some servers can mute/unmute hosts and schedule downtimes (write operations we intentionally excluded because we enjoy sleeping)
- Some servers can CRUD monitors and dashboards (see above re: AI movies, and also re: sleeping)
- Some servers have unique metric field exploration tools

We sleep *extremely* well at night.

</details>

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
LOG_FORMAT=pretty npx github:dreamiurg/datadog-mcp --apiKey ... --appKey ...
```

---

<details>
<summary><strong>Application Key Scopes</strong> (for least-privilege security)</summary>

Create an Application Key with only the scopes you need:

| Scope | Tools Unlocked |
|-------|---------------|
| `monitors_read` | `get-monitors`, `get-monitor`, `search-monitors`, `get-monitor-config-policies`, `list-monitor-notification-rules` |
| `dashboards_read` | `get-dashboards`, `get-dashboard`, `list-dashboard-lists` |
| `metrics_read` | `get-metrics`, `get-metric-metadata`, `query-metrics`, `search-metric-volumes`, `get-metric-tag-config`, `list-metric-tag-configs` |
| `events_read` | `get-events` |
| `logs_read_data` | `search-logs`, `aggregate-logs`, `get-log-pipelines`, `get-log-indexes`, `get-logs-pipeline-order`, `get-logs-archive-order`, `list-logs-metrics` |
| `hosts_read` | `get-hosts`, `get-host-tags`, `get-active-hosts-count`, `list-host-totals` |
| `containers_read` | `list-containers`, `get-containers` |
| `monitors_downtime` | `get-downtimes`, `list-downtime-schedules` |
| `slos_read` | `get-slos`, `get-slo`, `get-slo-history`, `get-slo-corrections`, `search-slos` |
| `apm_read` | `search-spans`, `aggregate-spans`, `get-trace`, `search-apm-events`, `list-active-apm-events`, `list-spans-metrics` |
| `apm_service_catalog_read` | `get-services`, `get-service-dependencies`, `list-service-definitions`, `get-service-definition` |
| `rum_read` | `search-rum-events`, `list-rum-applications`, `aggregate-rum-events` |
| `synthetics_read` | `get-synthetic-tests`, `get-synthetic-results`, `list-synthetics-global-variables`, `list-synthetics-locations`, `list-synthetics-private-locations` |
| `security_monitoring_findings_read` | `search-security-findings`, `get-security-finding`, `list-posture-findings`, `search-security-signals`, `list-vulnerabilities` |
| `security_monitoring_rules_read` | `list-security-rules`, `list-security-monitoring-rules` |
| `csm_agents_read` | `get-csm-coverage`, `list-csm-threats-agent-rules` |
| `teams_read` | `list-teams`, `list-team-members` |
| `user_access_read` | `list-users` |
| `notebooks_read` | `list-notebooks`, `get-notebook` |
| `ci_visibility_pipelines_read` | `list-ci-pipelines`, `get-ci-pipeline-events` |
| `ci_visibility_read` | `list-ci-tests`, `search-ci-test-events` |
| `error_tracking_read` | `search-error-tracking-issues` |
| `audit_trail_read` | `search-audit-logs` |
| `dbm_read` | `get-dbm-samples`, `get-dbm-query-metrics` |
| `usage_read` | `get-hourly-usage`, `get-top-avg-metrics`, `get-estimated-cost` |
| `ndm_read` | `list-network-devices`, `aggregate-network-connections` |
| `aws_configuration_read` | `list-aws-accounts` |
| `api_keys_read` | `list-api-keys`, `list-app-keys` |
| `auth_n_mappings_read` | `list-authn-mappings` |
| `incident_read` | `search-incidents`, `get-incident-todos`, `get-incident-timeline`, `get-incident-services` |
| `dora_deployment_read` | `list-dora-deployments` |
| `workflows_read` | `list-workflows`, `list-workflow-executions` |
| `fleet_read` | `list-fleet-agents` |
| `cost_management_read` | `list-cost-budgets` |

**Create a scoped key:** Organization Settings -> Application Keys -> New Key -> Select scopes

</details>

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
LOG_LEVEL=debug LOG_FORMAT=pretty npx github:dreamiurg/datadog-mcp --apiKey ... --appKey ...
```
</details>

---

## Development

```bash
git clone https://github.com/dreamiurg/datadog-mcp.git
cd datadog-mcp
npm install
npm run build
npm test
```

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript |
| `npm test` | Run tests (570 tests in 120 files) |
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

---

## Disclaimer

**In case it wasn't abundantly, blindingly, neon-sign-in-the-desert obvious:** the comparison tables above are written with tongue so firmly in cheek it's coming out the other side. This is sarcasm. We are being sarcastic. If you're still not sure, yes, that was also sarcasm.

Every single Datadog MCP server out there was built by engineers who cared enough to ship something real into the world. That's more than most people do on a Saturday. Open source is better when there are options, and the ecosystem is better because all of these projects exist.

If our 116 read-only tools aren't what you need, genuinely and sincerely: go find the one that is. Try them all. Mix and match. Build your own. Fork ours and add write operations if you're feeling brave (and have good backups). The best tool is the one that fits your workflow, not the one with the spiciest README.

Now go build something great. Sleep tight.

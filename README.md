# Datadog MCP Server

[![CI](https://github.com/dreamiurg/datadog-mcp-server/actions/workflows/ci.yml/badge.svg)](https://github.com/dreamiurg/datadog-mcp-server/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/dreamiurg/datadog-mcp-server/graph/badge.svg)](https://codecov.io/gh/dreamiurg/datadog-mcp-server)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/dreamiurg/datadog-mcp-server/badge)](https://scorecard.dev/viewer/?uri=github.com/dreamiurg/datadog-mcp-server)

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server that provides read-only access to Datadog resources. Query monitors, dashboards, logs, metrics, events, and incidents directly from Claude or other MCP-compatible clients.

## Installation

```bash
npx github:dreamiurg/datadog-mcp-server --help
```

**Requirements:** Node.js 20+

## Configuration

Most MCP-compatible tools use a similar JSON configuration. The core server configuration is:

```json
{
  "mcpServers": {
    "datadog": {
      "command": "npx",
      "args": [
        "github:dreamiurg/datadog-mcp-server",
        "--apiKey", "<YOUR_API_KEY>",
        "--appKey", "<YOUR_APP_KEY>",
        "--site", "datadoghq.com"
      ]
    }
  }
}
```

### Claude Code (CLI)

Add via CLI or edit the config file directly:

```bash
claude mcp add datadog -- npx github:dreamiurg/datadog-mcp-server \
  --apiKey <YOUR_API_KEY> \
  --appKey <YOUR_APP_KEY> \
  --site datadoghq.com
```

Or add to `~/.claude.json` (user scope) or `.mcp.json` (project scope):

```json
{
  "mcpServers": {
    "datadog": {
      "command": "npx",
      "args": ["github:dreamiurg/datadog-mcp-server", "--apiKey", "<YOUR_API_KEY>", "--appKey", "<YOUR_APP_KEY>", "--site", "datadoghq.com"]
    }
  }
}
```

### Gemini CLI

Add to `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "datadog": {
      "command": "npx",
      "args": ["github:dreamiurg/datadog-mcp-server", "--apiKey", "<YOUR_API_KEY>", "--appKey", "<YOUR_APP_KEY>", "--site", "datadoghq.com"]
    }
  }
}
```

### Codex CLI (OpenAI)

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.datadog]
command = "npx"
args = ["github:dreamiurg/datadog-mcp-server", "--apiKey", "<YOUR_API_KEY>", "--appKey", "<YOUR_APP_KEY>", "--site", "datadoghq.com"]
```

### Cursor / Windsurf / VS Code

| Tool | Config File |
|------|-------------|
| Cursor | `~/.cursor/mcp.json` or `.cursor/mcp.json` (project) |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` |
| VS Code | User Settings JSON (Ctrl+Shift+P > "Preferences: Open User Settings (JSON)") |

Use the standard JSON format shown above.

### Claude Desktop

Add to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

Use the standard JSON format shown above.

### Datadog Credentials

You need two credentials from your Datadog account:

- **API Key**: Organization Settings > API Keys
- **Application Key**: Organization Settings > Application Keys

### Regional Endpoints

Set `--site` based on your Datadog region:

| Region | Site Value |
|--------|------------|
| US (default) | `datadoghq.com` |
| EU | `datadoghq.eu` |
| US3 (GovCloud) | `ddog-gov.com` |
| US5 | `us5.datadoghq.com` |
| AP1 | `ap1.datadoghq.com` |

### Environment Variables

Alternatively, create a `.env` file in the working directory:

```bash
DD_API_KEY=your_api_key
DD_APP_KEY=your_app_key
DD_SITE=datadoghq.com
```

Optional overrides for service-specific endpoints:
- `DD_LOGS_SITE` - Logs API endpoint (defaults to `DD_SITE`)
- `DD_METRICS_SITE` - Metrics API endpoint (defaults to `DD_SITE`)

### Logging

The server uses structured logging via [pino](https://github.com/pinojs/pino). Logs are written to stderr to avoid interfering with the MCP protocol on stdout.

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `LOG_LEVEL` | `debug`, `info`, `warn`, `error` | `info` | Minimum log level |
| `LOG_FORMAT` | `json`, `pretty` | `json` | Output format |

**Production (JSON):**
```bash
# Structured JSON logs for log aggregators
npx github:dreamiurg/datadog-mcp-server --apiKey ... --appKey ...
```

**Development (Pretty):**
```bash
# Human-readable, colorized output
LOG_FORMAT=pretty npx github:dreamiurg/datadog-mcp-server --apiKey ... --appKey ...

# Or use NODE_ENV
NODE_ENV=development npx github:dreamiurg/datadog-mcp-server --apiKey ... --appKey ...
```

**Example pretty output:**
```
12:34:56 INFO  Starting Datadog MCP Server
12:34:56 INFO  Tool initialized (tool: get-monitors)
12:34:57 DEBUG executing get-monitors (tool: get-monitors)
12:34:58 INFO  get-monitors completed (tool: get-monitors, resultCount: 42, durationMs: 1200)
```

## Available Tools

| Tool | Description |
|------|-------------|
| `get-monitors` | List monitors with optional filtering by state, tags |
| `get-monitor` | Get a specific monitor by ID |
| `get-dashboards` | List all dashboards |
| `get-dashboard` | Get a specific dashboard by ID |
| `get-metrics` | List available metrics |
| `get-metric-metadata` | Get metadata for a specific metric |
| `get-events` | Fetch events within a time range |
| `get-incidents` | List incidents with optional filtering |
| `search-logs` | Search logs with query filtering |
| `aggregate-logs` | Perform analytics on log data |

## Application Key Scopes

For least-privilege access, create an Application Key with only the scopes you need:

| Tools | Required Scope |
|-------|----------------|
| `get-monitors`, `get-monitor` | `monitors_read` |
| `get-dashboards`, `get-dashboard` | `dashboards_read` |
| `get-metrics`, `get-metric-metadata` | `metrics_read` |
| `get-events` | `events_read` |
| `search-logs`, `aggregate-logs` | `logs_read_data` |
| `get-incidents` | `incident_read` |

Create a scoped key: **Organization Settings** > **Application Keys** > **New Key** > select scopes.

## Troubleshooting

### 403 Forbidden

1. Verify API key and Application key are correct
2. Check that your Application Key has the required [scopes](#application-key-scopes)
3. Confirm you're using the correct [regional endpoint](#regional-endpoints)

### Viewing MCP Logs

```bash
# Claude Desktop (macOS)
tail -f ~/Library/Logs/Claude/mcp*.log

# Claude Desktop (Windows PowerShell)
Get-Content "$env:APPDATA\Claude\Logs\mcp*.log" -Tail 20 -Wait

# Claude Code CLI
claude mcp list   # check server status
```

## Development

```bash
git clone https://github.com/dreamiurg/datadog-mcp-server.git
cd datadog-mcp-server
npm install
npm run build
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run dev` | Build and run the server |
| `npm run lint` | Run Biome linter |
| `npm run lint:fix` | Fix linting issues |
| `npm run format` | Format code with Biome |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run check` | Run typecheck + lint |
| `npm test` | Run tests |
| `npm run test:coverage` | Run tests with coverage report |

### Testing with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js \
  --apiKey=your_api_key \
  --appKey=your_app_key
```

## License

MIT

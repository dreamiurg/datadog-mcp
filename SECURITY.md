# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly:

1. **Do not** open a public GitHub issue for security vulnerabilities
2. Email the maintainers directly or use [GitHub's private vulnerability reporting](https://github.com/dreamiurg/datadog-mcp/security/advisories/new)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

## Response Timeline

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Resolution target**: Within 30 days for critical issues

## Security Best Practices

When using this MCP server:

- Store API keys and Application keys securely (use environment variables, not command line arguments in shared environments)
- Use Application Keys with minimal required scopes (see [README](README.md#application-key-scopes))
- Regularly rotate your Datadog credentials
- Review logs for unexpected access patterns

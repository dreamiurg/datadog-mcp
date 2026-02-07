# Agent Instructions

## Project

TypeScript MCP server for Datadog API. Node.js >= 20, CommonJS output.

## Stack

- **Language**: TypeScript (strict mode)
- **Build**: `tsc` (CommonJS output to `dist/`)
- **Linter/Formatter**: Biome (`npx biome check src`)
- **Tests**: Vitest with V8 coverage (90% uniform thresholds)
- **Complexity**: lizard (`-l typescript -C 15 -L 60 -a 5`)
- **Git hooks**: pre-commit framework (not Husky)

## Commands

| Task | Command |
|------|---------|
| Build | `npm run build` |
| Lint | `npm run lint` |
| Lint + fix | `npm run lint:fix` |
| Typecheck | `npm run typecheck` |
| Test | `npm test` |
| Test + coverage | `npm run test:coverage` |
| Complexity | `npm run complexity` |
| Full CI locally | `npm run ci` |

## Releases

**NEVER create GitHub releases or tags manually.** All releases go through Release Please:

1. Use conventional commits (`feat:`, `fix:`, `chore:`, etc.)
2. Release Please automatically creates/updates a release PR on each push to main
3. A human merges the release PR to cut the release
4. Release Please creates the GitHub release and tag automatically

When asked to "create a release", the correct action is to merge the pending Release Please PR (if one exists) or explain that new conventional commits need to be pushed to main first.

## GitHub

- **Repo**: `dreamiurg/datadog-mcp` (standalone, not a fork)
- **Merge strategy**: Squash-only
- **Branch protection**: Sentinel job (`Required Checks`) via ruleset
- **CI**: lint, typecheck, test (Node 20/22/23), complexity, build
- **PRs**: Always use `--repo dreamiurg/datadog-mcp` with `gh` CLI

## Code Style

- Biome handles formatting and linting - no manual style rules needed
- Max cognitive complexity: 15 (enforced by Biome + lizard)
- Max function length: 60 lines (enforced by lizard)
- Max parameters: 5 (enforced by lizard)

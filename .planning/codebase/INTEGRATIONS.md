# External Integrations

**Analysis Date:** 2026-03-26

## APIs & External Services

**None detected** - This CLI tool does not call any external APIs.

## Data Storage

**Databases:**
- None

**File Storage:**
- Local filesystem only
- Commands are copied as `.md` files to target project's `.claude/commands/` directory

**Caching:**
- None

## Authentication & Identity

**Auth Provider:**
- None - This is a standalone CLI installer

## Monitoring & Observability

**Error Tracking:**
- None

**Logs:**
- Console output only (`console.log`)

## CI/CD & Deployment

**Hosting:**
- GitHub Pages (via VitePress deployment workflow)

**CI Pipeline:**
- GitHub Actions (`.github/workflows/deploy.yml`)
- Triggers on push to `main` or `develop` branches
- Runs: Node 20, `npm install`, `npm run docs:build`
- Deploys to GitHub Pages via `actions/deploy-pages@v4`

**GitHub Integration:**
- Repository: `github.com/xiao-an-c/claude-tools`
- GitHub Actions used:
  - `actions/checkout@v4`
  - `actions/setup-node@v4`
  - `actions/configure-pages@v4`
  - `actions/upload-pages-artifact@v3`
  - `actions/deploy-pages@v4`

## Environment Configuration

**Required env vars:**
- None - No environment variables are used

**Secrets location:**
- Not applicable (no external API calls)

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

---

*Integration audit: 2026-03-26*

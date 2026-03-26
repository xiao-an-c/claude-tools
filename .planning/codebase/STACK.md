# Technology Stack

**Analysis Date:** 2026-03-26

## Languages

**Primary:**
- JavaScript (Node.js) - CLI tool implementation

**Secondary:**
- Markdown - Command definitions and documentation

## Runtime

**Environment:**
- Node.js >= 18.0.0 (per `package.json` `engines` field)

**Package Manager:**
- npm (v9.x based on package-lock.json v3 format)
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- None - pure Node.js CLI application

**Testing:**
- Jest ^29.7.0 - JavaScript testing framework

**Documentation:**
- VitePress ^1.6.4 - Static site generator for documentation
- Mermaid ^11.13.0 - Diagrams in documentation

**CLI:**
- readline (Node.js built-in) - Interactive CLI prompts

## Key Dependencies

**None** - This is a minimal CLI tool that relies only on Node.js built-in modules (`fs`, `path`, `readline`).

**Dev Dependencies:**
- `jest` ^29.7.0 - Testing framework
- `mermaid` ^11.13.0 - Diagram rendering for docs
- `vitepress` ^1.6.4 - Documentation site generator

## Configuration

**Project Config:**
- `package.json` - Project metadata, scripts, dependencies
- `jest.config.js` - Jest testing configuration
- `docs/.vitepress/config.mts` - VitePress site configuration

**Jest Configuration** (`jest.config.js`):
```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['bin/**/*.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov']
};
```

**VitePress Configuration** (`docs/.vitepress/config.mts`):
- Title: "Claude Tools"
- Base: `/claude-tools/` (for GitHub Pages deployment)
- Local search provider
- Mermaid diagram support via custom fence renderer

## Platform Requirements

**Development:**
- Node.js >= 18
- npm

**Production:**
- Node.js >= 18 (runtime only, no build step required for CLI)
- Target: Unix-like systems (CLI uses shebang `#!/usr/bin/env node`)

---

*Stack analysis: 2026-03-26*

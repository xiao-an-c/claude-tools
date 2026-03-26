# Codebase Structure

**Analysis Date:** 2026-03-26

## Directory Layout

```
/Users/denglian/mine/claude-tools/
├── bin/                    # CLI entry point
│   └── cli.js              # Main CLI implementation
├── commands/                # Source command templates
│   ├── git/                # Git workflow commands
│   │   ├── abort.md
│   │   ├── commit.md
│   │   ├── finish.md
│   │   ├── init.md
│   │   ├── publish.md
│   │   ├── start-feat.md
│   │   ├── start-fix.md
│   │   ├── start-hotfix.md
│   │   ├── start-refactor.md
│   │   ├── start-release.md
│   │   ├── status.md
│   │   ├── sync.md
│   │   └── wip.md
│   └── test/               # Test generation commands
│       ├── coverage.md
│       ├── generate.md
│       ├── review.md
│       └── snapshot.md
├── __tests__/              # Jest test suite
│   ├── cli.test.js         # CLI module tests
│   └── fixtures/           # Test fixtures
├── docs/                   # VitePress documentation
│   ├── guide/              # User guides
│   ├── commands/           # Command documentation
│   ├── specs/              # Specification docs
│   └── .vitepress/         # VitePress config
├── .claude/commands/       # Installed commands (development)
│   ├── git/
│   └── test/
├── .github/workflows/      # CI/CD configuration
├── coverage/               # Test coverage reports
├── package.json           # Project manifest
├── jest.config.js          # Jest configuration
└── README.md               # Project documentation
```

## Directory Purposes

**`bin/`:**
- Purpose: CLI entry point
- Contains: `cli.js` - the main executable
- Key files: `cli.js`

**`commands/`:**
- Purpose: Source command templates for distribution
- Contains: Category subdirectories with `.md` command files
- Key files: `git/*.md`, `test/*.md`

**`__tests__/`:**
- Purpose: Jest test suite
- Contains: `cli.test.js` - comprehensive tests for CLI functions
- Key files: `cli.test.js`

**`docs/`:**
- Purpose: VitePress documentation site
- Contains: User guides, command documentation, specifications

**`.claude/commands/`:**
- Purpose: Development installation target
- Contains: Copy of commands installed locally for development testing
- Note: This is gitignored - represents installed state, not source

## Key File Locations

**Entry Points:**
- `bin/cli.js`: Main CLI executable, shebang `#!/usr/bin/env node`

**Configuration:**
- `package.json`: Project metadata, dependencies, scripts, bin entry
- `jest.config.js`: Jest test runner configuration

**Core Logic:**
- `bin/cli.js`: All CLI functionality (292 lines)

**Testing:**
- `__tests__/cli.test.js`: Complete test suite for CLI module

## Naming Conventions

**Files:**
- JavaScript: `lowercase.js` (cli.js, jest.config.js)
- Markdown commands: `kebab-case.md` (start-feat.md, commit.md)
- Directories: `lowercase/` (bin/, commands/, docs/)

**Functions:**
- camelCase: `getPackageDir`, `loadCategories`, `installCommands`, `installAll`

**Variables:**
- camelCase: `packageDir`, `targetDir`, `consoleOutput`
- UPPER_SNAKE for constants: `TARGET_BASE`

**Categories (directory names):**
- lowercase: `git`, `test`

**Commands (file names):**
- kebab-case: `start-feat`, `start-hotfix`, `sync`

## Where to Add New Code

**New Command in Existing Category:**
1. Create new `.md` file in `commands/{category}/`
2. Follow YAML frontmatter pattern (name, description, allowed-tools)
3. Add markdown body with `<objective>`, `<rules>`, `<process>`, `<execution>` sections

**New Category:**
1. Create new directory under `commands/` (e.g., `commands/workflow/`)
2. Add `.md` command files to the new directory
3. Update `getCategoryDescription()` in `bin/cli.js` to include the new category
4. Category is auto-discovered for installation

**New CLI Function:**
1. Add function to `bin/cli.js`
2. Export function in `module.exports` object
3. Add corresponding tests in `__tests__/cli.test.js`

**Test Fixtures:**
- Location: `__tests__/fixtures/`
- Create subdirectory structure matching your fixture needs

## Special Directories

**`.claude/commands/`:**
- Purpose: Claude Code custom commands directory
- Generated: Yes, by CLI installation process
- Committed: No, gitignored

**`coverage/`:**
- Purpose: Jest coverage reports
- Generated: Yes, by `npm test -- --coverage`
- Committed: Yes, for CI visibility

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes, by `npm install`
- Committed: No

**`.vitepress/dist/`:**
- Purpose: Built VitePress site
- Generated: Yes, by `npm run docs:build`
- Committed: Yes, for GitHub Pages deployment

---

*Structure analysis: 2026-03-26*

# Architecture

**Analysis Date:** 2026-03-26

## Pattern Overview

**Overall:** Plugin Installer Pattern (Command Distribution System)

**Key Characteristics:**
- CLI tool that installs markdown-based command templates into Claude Code's `.claude/commands/` directory
- Command files are YAML-frontmatter markdown documents that define AI agent instructions
- Dynamic discovery of available commands from filesystem at runtime
- No build step - pure runtime composition of command categories

## Layers

**CLI Entry Layer:**
- Purpose: Command-line interface and argument parsing
- Location: `bin/cli.js`
- Contains: Main CLI logic, argument parsing, help display, interactive prompts
- Depends on: Node.js built-in modules (fs, path, readline)
- Used by: End users via npx or direct execution

**Command Template Layer:**
- Purpose: Source command definitions organized by category
- Location: `commands/{category}/*.md`
- Contains: Git workflow commands (abort, commit, finish, etc.) and test commands (generate, review, coverage, snapshot)
- Depends on: None (static markdown files)
- Used by: CLI during installation to copy to target projects

**Installation Target:**
- Location: `{targetProject}/.claude/commands/{category}/{command}.md`
- Purpose: Claude Code command prompts that appear as `/category:command` in the agent

## Data Flow

**Command Installation Flow:**

1. User invokes CLI with options (e.g., `--all`, `-c git`, `--commands commit,sync`)
2. CLI parses arguments, determines target directory (cwd or specified path)
3. CLI loads category configuration via `loadCategories()` - reads `commands/` subdirectories
4. For each command to install:
   - Source: `commands/{category}/{command}.md`
   - Destination: `{targetDir}/.claude/commands/{category}/{command}.md`
5. CLI creates target directories recursively, copies markdown files
6. Output confirms installation success/failure

**Category Discovery Flow:**

1. `loadCategories()` scans `commands/` directory for subdirectories
2. Each subdirectory name becomes a category
3. Files ending in `.md` within category directory become commands
4. Category descriptions loaded from `getCategoryDescription()` map

## Key Abstractions

**CLI Module:**
- Purpose: Central module exporting all installation functions
- Examples: `bin/cli.js`
- Pattern: CommonJS module with named exports for all public functions
- Exported: `getPackageDir`, `loadCategories`, `getCategoryDescription`, `installCommands`, `installAll`, `installCategory`, `installSpecific`, `interactiveSelect`, `showHelp`, `listCommands`, `main`, `TARGET_BASE`

**Command Template:**
- Purpose: Markdown file defining a Claude Code command
- Examples: `commands/git/commit.md`, `commands/test/generate.md`
- Pattern: YAML frontmatter (name, description, allowed-tools) + markdown body with `<objective>`, `<rules>`, `<process>`, `<execution>` sections

**Category Configuration:**
- Purpose: Groups related commands under a namespace
- Examples: `git`, `test` categories
- Pattern: Dynamic - discovered at runtime from directory structure, descriptions in `getCategoryDescription()` function

## Entry Points

**Direct Execution:**
- Location: `bin/cli.js`
- Triggers: `node bin/cli.js [options] [targetDir]` or `npx github:xiao-an-c/claude-tools`
- Responsibilities: Parses args, executes installation, displays output

**Module Import:**
- Location: `bin/cli.js`
- Triggers: `require('../bin/cli.js')` in tests
- Responsibilities: Exports all functions for programmatic use and testing

## Error Handling

**Strategy:** Graceful degradation with console output

**Patterns:**
- Source directory missing: Return `{ installed: 0, failed: commands.length }` with error message
- Command file not found: Report individual failure, continue with remaining commands
- Invalid category: Exit with code 1 when called directly, return empty result when imported
- Target directory access issues: fs.mkdirSync with `recursive: true` handles creation

## Cross-Cutting Concerns

**Logging:** Direct console.log for status output (install progress, errors)

**Validation:** Argument parsing via `args.includes()` and `args.findIndex()`, no formal validation schema

**Authentication:** Not applicable - this is a read-only installer that copies files

---

*Architecture analysis: 2026-03-26*

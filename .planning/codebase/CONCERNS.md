# Codebase Concerns

**Analysis Date:** 2026-03-26

## Tech Debt

**Single Large CLI Module:**
- Issue: `bin/cli.js` is a 291-line monolithic file containing all CLI logic (parsing, file operations, UI)
- Files: `bin/cli.js`
- Impact: Difficult to maintain, test, and extend. All concerns (I/O, validation, display) are tightly coupled
- Fix approach: Extract into separate modules (e.g., `src/parser.js`, `src/installer.js`, `src/ui.js`)

**Hardcoded Category Descriptions:**
- Issue: `getCategoryDescription()` uses a static object instead of loading descriptions from command files
- Files: `bin/cli.js` (lines 45-51)
- Impact: Adding new categories requires code changes. Descriptions can get out of sync with actual commands
- Fix approach: Parse descriptions from command file frontmatter dynamically

**Synchronous File Operations:**
- Issue: Multiple `fs.readdirSync`, `fs.copyFileSync`, `fs.mkdirSync` calls block the event loop
- Files: `bin/cli.js`
- Impact: CLI may hang on slow I/O, especially when installing to network drives
- Fix approach: Convert to async/await pattern using `fs.promises`

**No Input Validation:**
- Issue: `getCategoryDescription()` accepts null/undefined/empty strings without proper handling
- Files: `bin/cli.js` (lines 45-51)
- Impact: Returns nonsensical strings like `"null 命令"` or `"undefined 命令"`
- Fix approach: Add validation and return a default description for invalid inputs

**Missing Error Handling for File Operations:**
- Issue: `fs.readdirSync`, `fs.copyFileSync`, `fs.existsSync` can throw but are not wrapped in try/catch
- Files: `bin/cli.js` (lines 19-41, 98-130)
- Impact: Unexpected errors (permissions, disk full, corrupted files) crash the CLI ungracefully
- Fix approach: Wrap file operations in try/catch with user-friendly error messages

## Known Bugs

**Path Traversal Vulnerability in installCommands:**
- Symptoms: Command names like `../../etc/passwd` could write files outside target directory
- Files: `bin/cli.js` (lines 115-127)
- Trigger: Calling `installCommands(['../../../etc/passwd'], 'git', targetDir)`
- Workaround: None - input not sanitized
- Fix approach: Validate command names against a whitelist pattern before copying

**Empty Command Array Defaulting to Git:**
- Issue: `installSpecific('')` defaults to git category but produces confusing output
- Files: `bin/cli.js` (lines 192-218)
- Trigger: `cli.installSpecific('', tempTargetDir)` produces "安装完成" with 0 installed commands
- Workaround: Explicitly validate empty command strings before processing

**Test Expects Nonsensical Output:**
- Issue: Test at line 67-68 expects `getCategoryDescription(null)` to return `"null 命令"`
- Files: `__tests__/cli.test.js` (lines 62-68)
- Impact: Test validates the buggy behavior rather than correct behavior
- Fix approach: Fix `getCategoryDescription` to return proper default and update test

**Jest Mocks Module Caching Issue:**
- Issue: `jest.isolateModulesAsync` at line 109 may not properly reset module cache between tests
- Files: `__tests__/cli.test.js` (lines 107-120)
- Impact: Tests may have interdependencies if module state leaks
- Fix approach: Use `jest.resetModules()` explicitly

## Security Considerations

**No Path Sanitization in File Copy:**
- Risk: Malicious command names could contain path traversal sequences
- Files: `bin/cli.js` (lines 115-127)
- Current mitigation: None
- Recommendations:
  - Validate command names match pattern: `^[a-zA-Z0-9_-]+$`
  - Use `path.resolve()` to verify target path is within target directory
  - Add `--dry-run` flag to preview what would be installed

**No Validation of Target Directory:**
- Risk: Installing to system directories (e.g., `/`, `/root`) could cause damage
- Files: `bin/cli.js` (lines 98-130)
- Current mitigation: None
- Recommendations: Warn when target is root or system directory

**Commands Directory is User-Controlled Content:**
- Risk: Command `.md` files are installed verbatim and could contain malicious instructions
- Files: `commands/**/*.md`
- Current mitigation: None - these are user-created commands for Claude Code
- Recommendations: Document that only trusted command files should be installed

## Performance Bottlenecks

**Module-Level loadCategories() Execution:**
- Problem: `loadCategories()` runs synchronously at module load time (line 54)
- Files: `bin/cli.js` (line 54)
- Cause: `const CATEGORIES = loadCategories()` executes before any CLI logic
- Improvement path: Lazy load categories on first command invocation

**Synchronous Directory Scanning:**
- Problem: `fs.readdirSync` blocks for entire directory scan
- Files: `bin/cli.js` (lines 23-25, 29)
- Improvement path: Use async `fs.readdir` with caching

## Fragile Areas

**interactiveSelect with Async Callback:**
- Files: `bin/cli.js` (lines 133-161)
- Why fragile: Uses readline callback pattern. If callback throws or never resolves, readline interface hangs
- Safe modification: Ensure callback always called, handle errors gracefully
- Test coverage: Limited - only happy path tested

**main() Function Complexity:**
- Files: `bin/cli.js` (lines 221-270)
- Why fragile: Complex argument parsing with multiple flags, index-based argument extraction
- Safe modification: Extract to dedicated argument parser class/function
- Test coverage: Tests exist but don't cover all flag combinations

**Dynamic Command Loading from Filesystem:**
- Files: `bin/cli.js` (lines 14-42)
- Why fragile: Assumes filesystem is stable. Race conditions possible if commands directory changes during execution
- Safe modification: Cache category list, add refresh mechanism

## Scaling Limits

**Linear File Copy Loop:**
- Current capacity: Can install ~100+ commands without issues
- Limit: No batching - each file copied sequentially
- Scaling path: Use Promise.all() for parallel copies when multiple commands installed

**No Concurrent Installation Support:**
- Current capacity: Single installation at a time
- Limit: If called multiple times, file operations could conflict
- Scaling path: Add file locking mechanism

## Dependencies at Risk

**jest Version ^29.7.0:**
- Risk: Major jest updates may break test syntax or behavior
- Impact: Tests may fail on jest upgrade
- Migration plan: Pin to minor version, review changelog before upgrading

**No Runtime Dependencies:**
- This project has minimal runtime dependencies (only Node.js built-ins)
- Low supply chain risk

## Missing Critical Features

**No Undo/Rollback for Installation:**
- Problem: If installation fails midway, partial state remains
- Blocks: Safe experimentation with installation

**No Installation Verification:**
- Problem: After install, no check that files were copied correctly
- Blocks: Detecting corrupted or incomplete installations

**No Update Mechanism:**
- Problem: No way to update installed commands to newer versions
- Blocks: Keeping commands up to date across projects

## Test Coverage Gaps

**No Integration Tests:**
- What's not tested: Full end-to-end installation workflow
- Files: No integration test file exists
- Risk: Discrepancies between unit-tested logic and actual behavior
- Priority: High

**Untested Error Paths:**
- What's not tested:
  - `fs.existsSync` returning false unexpectedly
  - `fs.copyFileSync` failing mid-copy
  - `fs.mkdirSync` failing due to permissions
- Files: `__tests__/cli.test.js`
- Risk: Error handling code is never executed in tests
- Priority: Medium

**Untested interactiveSelect Edge Cases:**
- What's not tested:
  - Non-numeric input
  - Input with special characters
  - Empty input (just pressing Enter)
- Files: `__tests__/cli.test.js` (lines 326-393)
- Risk: Interactive mode may break on unexpected input
- Priority: Medium

**No Test for Concurrent Module Access:**
- What's not tested: Behavior when CLI is required from multiple contexts simultaneously
- Files: N/A
- Risk: Module-level state (`CATEGORIES`) may cause issues
- Priority: Low

---

*Concerns audit: 2026-03-26*

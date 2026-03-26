# Coding Conventions

**Analysis Date:** 2026-03-26

## Naming Patterns

**Files:**
- JavaScript: `camelCase.js` - e.g., `cli.js`
- Markdown command files: `kebab-case.md` - e.g., `commit.md`, `start-feat.md`

**Functions:**
- `camelCase` - e.g., `getPackageDir`, `loadCategories`, `installCommands`
- Private-looking functions (internal use): Same pattern, no underscore prefix

**Variables:**
- `camelCase` - e.g., `packageDir`, `targetPath`, `consoleOutput`
- Constants: `SCREAMING_SNAKE_CASE` not used; values assigned directly

**Types:**
- No TypeScript used; plain JavaScript only

## Code Style

**Language:** JavaScript (CommonJS)

**Formatting:**
- No Prettier configuration detected
- No ESLint configuration detected
- Manual formatting observed
- 2-space indentation in `bin/cli.js`

**Module System:**
```javascript
const fs = require('fs');
const path = require('path');
// ...
module.exports = { /* named exports */ };
```

**Import Order:**
1. Node.js built-ins (`fs`, `path`, `os`, `readline`)
2. No external npm packages imported in main code

## Error Handling

**Patterns:**
- `if (!fs.existsSync(path))` checks before file operations
- Early returns with error messages via `console.log`
- `process.exit(1)` for fatal CLI errors (in module-check mode)
- Return objects with `{ installed, failed }` counts rather than throwing

**Example (bin/cli.js:104-107):**
```javascript
if (!fs.existsSync(sourcePath)) {
  console.log(`   ❌ 源目录不存在: ${sourcePath}`);
  return { installed: 0, failed: commands.length };
}
```

## Logging

**Framework:** Plain `console.log` (no logging library)

**Patterns:**
- Emoji-prefixed status messages: `✅`, `❌`, `📦`, `🔧`, `📋`
- Structured output with category brackets: `[git]`, `[category]`
- Template literals for dynamic content

**Example (bin/cli.js:121):**
```javascript
console.log(`   ✅ /${category}:${cmd}`);
```

## Comments

**Language:** Chinese comments explaining intent

**When Used:**
- Function purpose comments: `// 获取包目录`
- Section dividers: `// 动态加载命令配置`
- Operation labels: `// 检查源目录是否存在`

## Function Design

**Size:** Small, single-purpose functions (e.g., `getPackageDir` returns one value)

**Parameters:**
- Max 3 parameters typical
- Pass options via object destructuring not observed

**Return Values:**
- Functions return meaningful values (paths, objects, counts)
- Void functions use `console.log` for output

## Module Design

**Exports:**
```javascript
module.exports = {
  getPackageDir,
  loadCategories,
  getCategoryDescription,
  installCommands,
  // ...
};
```

**Direct Execution Check:**
```javascript
if (require.main === module) {
  main();
}
```

**Single Entry Point:** All logic in `bin/cli.js`

## CLI Argument Parsing

**Pattern:** Manual argument parsing with `process.argv.slice(2)`

**Example (bin/cli.js:57, 223-234):**
```javascript
const args = process.argv.slice(2);
// ...
const flagAll = args.includes('--all') || args.includes('-a');
const flagList = args.includes('--list') || args.includes('-l');
```

## Testing Conventions

**Test Location:** `__tests__/` directory, co-located with test subject via naming convention

**Test File Naming:** `*.test.js` pattern (Jest default)

**Setup/Teardown:**
- `beforeEach` for initialization
- `afterEach` for cleanup
- `jest.clearAllMocks()` in `beforeEach`
- `jest.restoreAllMocks()` in `afterEach`

---

*Convention analysis: 2026-03-26*

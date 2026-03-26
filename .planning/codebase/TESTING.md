# Testing Patterns

**Analysis Date:** 2026-03-26

## Test Framework

**Runner:**
- Jest v29.7.0
- Config: `jest.config.js`

**Assertion Library:**
- Built-in Jest assertions (`expect`)

**Run Commands:**
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Test File Organization

**Location:**
- `__tests__/` directory (root level)
- Pattern: `*.test.js`

**Naming:**
- `cli.test.js` for `bin/cli.js`

**Structure:**
```
__tests__/
├── cli.test.js    # Main test file
└── fixtures/       # Test fixtures
    └── commands/  # Command markdown files for integration tests
```

## Test Structure

**Suite Organization:**
```javascript
describe('CLI 模块', () => {
  let cli;

  beforeEach(() => {
    cli = require('../bin/cli.js');
  });

  describe('getPackageDir', () => {
    test('应返回包目录路径', () => {
      const result = cli.getPackageDir();
      expect(result).toBe(path.dirname(path.dirname(__filename)));
    });
  });
  // ...
});
```

**Patterns:**
- Outer `describe` for module name in Chinese
- `let cli` variable re-required in each `beforeEach`
- Inner `describe` blocks for each function under test
- Individual `test` cases with Chinese descriptions

**Setup Pattern:**
```javascript
beforeEach(() => {
  jest.clearAllMocks();
  consoleOutput = [];
  console.log = jest.fn((...args) => {
    consoleOutput.push(args.join(' '));
  });
});
```

**Teardown Pattern:**
```javascript
afterEach(() => {
  console.log = originalLog;
  jest.restoreAllMocks();
});
```

## Mocking

**Framework:** Jest native mocking

**Patterns:**

**1. Console Output Capture:**
```javascript
let consoleOutput = [];
const originalLog = console.log;

beforeEach(() => {
  console.log = jest.fn((...args) => {
    consoleOutput.push(args.join(' '));
  });
});

afterEach(() => {
  console.log = originalLog;
});
```

**2. Module Mocking with `jest.doMock`:**
```javascript
jest.doMock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn().mockReturnValue(false)
}));
```

**3. Method Spying:**
```javascript
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
// ... test ...
mockExit.mockRestore();
```

**4. Readline Interface Mocking:**
```javascript
const mockRl = {
  question: jest.fn((_, callback) => callback('1')),
  close: jest.fn()
};
jest.spyOn(readline, 'createInterface').mockReturnValue(mockRl);
```

**What to Mock:**
- `console.log` for output capture
- `fs` filesystem operations (using temp directories)
- `readline` for interactive prompts
- `process.exit` to prevent test termination

## Fixtures and Factories

**Test Data:**
- Temporary directories via `fs.mkdtempSync`
- Location: `os.tmpdir()` with prefix `claude-tools-test-`

**Example Pattern:**
```javascript
let tempTargetDir;

beforeEach(() => {
  tempTargetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-tools-test-'));
});

afterEach(() => {
  fs.rmSync(tempTargetDir, { recursive: true, force: true });
});
```

**Real Command Files:**
- `__tests__/fixtures/commands/` contains actual `.md` files for integration testing

## Coverage

**Configuration:**
```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['bin/**/*.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov']
};
```

**Current Coverage:**
- Only `bin/**/*.js` is covered (single file `bin/cli.js`)

**Requirements:** No explicit coverage threshold enforced

**View Coverage:**
```bash
npm run test:coverage
# Output in coverage/lcov.info and coverage/lcov-report/
```

## Test Types

**Unit Tests:**
- Test individual functions in isolation
- Mock console output to verify behavior
- Use `jest.isolateModulesAsync` for module-level mocking

**Integration Tests:**
- Use real filesystem with temp directories
- Copy actual command files to verify installation logic
- Test file existence as assertions

**E2E Tests:** Not used

## Common Patterns

**Async Testing:**
- Uses `done` callback for async verification
- Uses `jest.isolateModulesAsync` for async module loading

**Example:**
```javascript
test('当命令无前缀时应默认为 git 类别', (done) => {
  const mockRl = {
    question: jest.fn((_, callback) => callback('1')),
    close: jest.fn()
  };
  jest.spyOn(readline, 'createInterface').mockReturnValue(mockRl);

  cli.interactiveSelect(tempTargetDir, (selectedCategories) => {
    expect(selectedCategories).toEqual(['git']);
    done();
  });
});
```

**Error Testing:**
```javascript
test('当命令数组为 null 时应抛出 TypeError', () => {
  expect(() => cli.installCommands(null, 'git', tempTargetDir)).toThrow(TypeError);
});
```

## Jest Configuration

**File:** `jest.config.js`

**Settings:**
- `testEnvironment`: 'node'
- `testMatch`: `['**/__tests__/**/*.test.js']`
- `collectCoverageFrom`: `['bin/**/*.js']`

---

*Testing analysis: 2026-03-26*

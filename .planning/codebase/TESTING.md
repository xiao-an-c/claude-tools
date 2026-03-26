# 测试模式

**分析日期：** 2026-03-26

## 测试框架

**测试运行器：**
- Jest v29.7.0
- 配置：`jest.config.js`

**断言库：**
- Jest 内置断言（`expect`）

**运行命令：**
```bash
npm test              # 运行所有测试
npm run test:watch    # 监听模式
npm run test:coverage # 覆盖率报告
```

## 测试文件组织

**位置：**
- `__tests__/` 目录（根目录级别）
- 模式：`*.test.js`

**命名：**
- `cli.test.js` 对应 `bin/cli.js`

**结构：**
```
__tests__/
├── cli.test.js    # 主测试文件
└── fixtures/       # 测试 fixtures
    └── commands/  # 命令 Markdown 文件，用于集成测试
```

## 测试结构

**套件组织：**
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

**模式：**
- 外层 `describe` 用中文模块名
- 每个 `beforeEach` 中重新 require `cli`
- 内层 `describe` 块按被测函数组织
- 单个 `test` 用中文描述

**Setup 模式：**
```javascript
beforeEach(() => {
  jest.clearAllMocks();
  consoleOutput = [];
  console.log = jest.fn((...args) => {
    consoleOutput.push(args.join(' '));
  });
});
```

**Teardown 模式：**
```javascript
afterEach(() => {
  console.log = originalLog;
  jest.restoreAllMocks();
});
```

## Mock 模式

**框架：** Jest 原生 Mock

**模式：**

**1. 控制台输出捕获：**
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

**2. 模块 Mock（`jest.doMock`）：**
```javascript
jest.doMock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn().mockReturnValue(false)
}));
```

**3. 方法监听（Spy）：**
```javascript
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
// ... test ...
mockExit.mockRestore();
```

**4. Readline 接口 Mock：**
```javascript
const mockRl = {
  question: jest.fn((_, callback) => callback('1')),
  close: jest.fn()
};
jest.spyOn(readline, 'createInterface').mockReturnValue(mockRl);
```

**需要 Mock 的内容：**
- `console.log` 用于输出捕获
- `fs` 文件系统操作（使用临时目录）
- `readline` 用于交互提示
- `process.exit` 防止测试终止

## Fixtures 和工厂

**测试数据：**
- 通过 `fs.mkdtempSync` 创建临时目录
- 位置：`os.tmpdir()` 前缀为 `claude-tools-test-`

**示例模式：**
```javascript
let tempTargetDir;

beforeEach(() => {
  tempTargetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-tools-test-'));
});

afterEach(() => {
  fs.rmSync(tempTargetDir, { recursive: true, force: true });
});
```

**真实命令文件：**
- `__tests__/fixtures/commands/` 包含用于集成测试的真实 `.md` 文件

## 覆盖率

**配置：**
```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['bin/**/*.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov']
};
```

**当前覆盖率：**
- 仅覆盖 `bin/**/*.js`（单文件 `bin/cli.js`）

**要求：** 未强制执行显式覆盖率阈值

**查看覆盖率：**
```bash
npm run test:coverage
# 输出到 coverage/lcov.info 和 coverage/lcov-report/
```

## 测试类型

**单元测试：**
- 隔离测试单个函数
- Mock console 输出验证行为
- 使用 `jest.isolateModulesAsync` 做模块级 Mock

**集成测试：**
- 使用真实文件系统配合临时目录
- 复制真实命令文件验证安装逻辑
- 用文件存在性做断言

**E2E 测试：** 未使用

## 常见模式

**异步测试：**
- 使用 `done` 回调做异步验证
- 使用 `jest.isolateModulesAsync` 做异步模块加载

**示例：**
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

**错误测试：**
```javascript
test('当命令数组为 null 时应抛出 TypeError', () => {
  expect(() => cli.installCommands(null, 'git', tempTargetDir)).toThrow(TypeError);
});
```

## Jest 配置

**文件：** `jest.config.js`

**设置：**
- `testEnvironment`：'node'
- `testMatch`：`['**/__tests__/**/*.test.js']`
- `collectCoverageFrom`：`['bin/**/*.js']`

---

*测试分析：2026-03-26*

# 编码规范

**分析日期：** 2026-03-26

## 命名模式

**文件：**
- JavaScript：`camelCase.js` — 如 `cli.js`
- Markdown 命令文件：`kebab-case.md` — 如 `commit.md`、`start-feat.md`

**函数：**
- `camelCase` — 如 `getPackageDir`、`loadCategories`、`installCommands`
- 私有函数（内部使用）：同样模式，不使用下划线前缀

**变量：**
- `camelCase` — 如 `packageDir`、`targetPath`、`consoleOutput`
- 常量：未使用 `SCREAMING_SNAKE_CASE`，直接赋值使用

**类型：**
- 未使用 TypeScript，仅用纯 JavaScript

## 代码风格

**语言：** JavaScript（CommonJS）

**格式化：**
- 未检测到 Prettier 配置
- 未检测到 ESLint 配置
- 手动格式化
- `bin/cli.js` 使用 2 空格缩进

**模块系统：**
```javascript
const fs = require('fs');
const path = require('path');
// ...
module.exports = { /* named exports */ };
```

**导入顺序：**
1. Node.js 内置模块（`fs`、`path`、`os`、`readline`）
2. 主代码中无外部 npm 包导入

## 错误处理

**模式：**
- 文件操作前用 `if (!fs.existsSync(path))` 检查
- 通过 `console.log` 提前返回并输出错误信息
- 致命 CLI 错误使用 `process.exit(1)`（在模块检查模式下）
- 返回 `{ installed, failed }` 计数对象而非抛出异常

**示例（bin/cli.js:104-107）：**
```javascript
if (!fs.existsSync(sourcePath)) {
  console.log(`   ❌ 源目录不存在: ${sourcePath}`);
  return { installed: 0, failed: commands.length };
}
```

## 日志

**框架：** 纯 `console.log`（无日志库）

**模式：**
- Emoji 前缀状态消息：`✅`、`❌`、`📦`、`🔧`、`📋`
- 结构化输出带分类括号：`[git]`、`[category]`
- 模板字符串处理动态内容

**示例（bin/cli.js:121）：**
```javascript
console.log(`   ✅ /${category}:${cmd}`);
```

## 注释

**语言：** 中文注释解释意图

**使用场景：**
- 函数用途注释：`// 获取包目录`
- 章节分隔：`// 动态加载命令配置`
- 操作标签：`// 检查源目录是否存在`

## 函数设计

**大小：** 小型、单一职责函数（如 `getPackageDir` 只返回一个值）

**参数：**
- 通常最多 3 个参数
- 未观察到通过对象解构传递选项

**返回值：**
- 函数返回有意义的值（路径、对象、计数）
- void 函数使用 `console.log` 输出

## 模块设计

**导出：**
```javascript
module.exports = {
  getPackageDir,
  loadCategories,
  getCategoryDescription,
  installCommands,
  // ...
};
```

**直接执行检查：**
```javascript
if (require.main === module) {
  main();
}
```

**单一入口点：** 所有逻辑在 `bin/cli.js` 中

## CLI 参数解析

**模式：** 通过 `process.argv.slice(2)` 手动解析参数

**示例（bin/cli.js:57, 223-234）：**
```javascript
const args = process.argv.slice(2);
// ...
const flagAll = args.includes('--all') || args.includes('-a');
const flagList = args.includes('--list') || args.includes('-l');
```

## 测试规范

**测试位置：** `__tests__/` 目录，通过命名约定与被测代码同位置

**测试文件命名：** `*.test.js` 模式（Jest 默认）

**Setup/Teardown：**
- `beforeEach` 用于初始化
- `afterEach` 用于清理
- `beforeEach` 中 `jest.clearAllMocks()`
- `afterEach` 中 `jest.restoreAllMocks()`

---

*规范分析：2026-03-26*

---
name: test:coverage
description: 读取项目覆盖率配置，运行覆盖率分析，对低覆盖率文件给出补测建议
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
  - AskUserQuestion
---

<objective>
从项目配置中读取覆盖率阈值，运行覆盖率命令，找出未达标的文件，并给出具体的补测建议。
</objective>

<rules>
覆盖率阈值优先级（从高到低）：
1. `jest.config.js/ts/mjs` 中的 `coverageThreshold`
2. `package.json` 中的 `jest.coverageThreshold`
3. `vitest.config.js/ts` 中的 `coverage.thresholds`
4. `.nycrc` 或 `nyc` 配置（Mocha）
5. 以上均无配置时，使用默认值 80%，并提示用户可自定义

阈值类型：
- `global` — 全局阈值（lines/branches/functions/statements）
- `per-file` — 单文件阈值
- 如果配置了多种，以最严格的为准
</rules>

<process>
1. 读取项目覆盖率阈值配置
2. 检测测试框架和覆盖率命令
3. 运行覆盖率分析
4. 解析结果，找出低于阈值的文件
5. 对低覆盖率文件给出补测建议
</process>

<execution>
## 1. 读取覆盖率阈值配置

```bash
# 检查 jest 配置
cat jest.config.js 2>/dev/null || cat jest.config.ts 2>/dev/null || cat jest.config.mjs 2>/dev/null

# 检查 package.json 中的 jest 配置
cat package.json | grep -A 20 '"jest"'

# 检查 vitest 配置
cat vitest.config.js 2>/dev/null || cat vitest.config.ts 2>/dev/null

# 检查 nyc 配置
cat .nycrc 2>/dev/null || cat .nycrc.json 2>/dev/null
```

提取阈值，例如：
```
📋 项目覆盖率阈值配置:
  来源: jest.config.js → coverageThreshold.global
  lines:      80%
  branches:   70%
  functions:  80%
  statements: 80%
```

如果未找到任何配置：
```
⚠️  未找到覆盖率阈值配置，使用默认值 80%
💡 可在 jest.config.js 中添加:
   coverageThreshold: { global: { lines: 80, branches: 70, functions: 80 } }
```

## 2. 检测覆盖率命令

```bash
# 检查 package.json scripts
cat package.json | grep -E '"test:coverage|coverage"'
```

优先使用项目已有的 script，否则：
- Jest: `npx jest --coverage`
- Vitest: `npx vitest run --coverage`
- Mocha + nyc: `npx nyc mocha`

## 3. 运行覆盖率分析

```bash
npm run test:coverage 2>&1 || npx jest --coverage 2>&1
```

## 4. 解析结果

从输出中提取覆盖率表格，找出低于阈值的文件：

```
📊 覆盖率分析结果
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
文件                    | Stmts | Branch | Funcs | Lines
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ src/utils/parser.js  |  45%  |  30%   |  50%  |  45%
⚠️  src/api/client.js   |  72%  |  65%   |  75%  |  72%
✅ src/models/user.js   |  95%  |  88%   |  100% |  95%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
整体: ❌ 未达标 (lines: 68% < 80%)
```

## 5. 补测建议

对每个低覆盖率文件，读取源码，识别未覆盖的代码路径：

```bash
# 查看详细覆盖率报告（如果有 lcov）
cat coverage/lcov-report/src/utils/parser.js.html 2>/dev/null
```

针对未覆盖的分支/函数，给出具体建议：

```
📝 src/utils/parser.js 补测建议:
  1. parseDate() — 缺少对无效日期格式的测试
     建议: it('should throw when date format is invalid', ...)
  2. formatOutput() 第 45 行 — else 分支未覆盖
     建议: 添加 options.format = 'xml' 的测试用例
  3. validateSchema() — 完全未测试
     建议: 添加 valid/invalid schema 的基础测试
```

## 输出总结

```
📊 覆盖率总结
  达标文件: X 个 ✅
  需改进:   X 个 ⚠️
  未达标:   X 个 ❌

💡 优先补测: src/utils/parser.js（当前 45%，差距最大）
```
</execution>

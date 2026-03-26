# test:coverage

读取项目覆盖率配置，运行覆盖率分析，对低覆盖率文件给出具体的补测建议。

## 使用方式

```
/test:coverage
```

## 示例

```bash
/test:coverage
```

## 覆盖率阈值

命令会按优先级读取以下配置：

| 优先级 | 来源 | 配置字段 |
|--------|------|----------|
| 1 | `jest.config.js/ts/mjs` | `coverageThreshold.global` |
| 2 | `package.json` → `jest` | `coverageThreshold` |
| 3 | `vitest.config.js/ts` | `coverage.thresholds` |
| 4 | `.nycrc` / `.nycrc.json` | (Mocha) |
| 5 | 默认值 | 80%（未配置时） |

## 输出格式

### 阈值配置显示

```
📋 项目覆盖率阈值配置:
  来源: jest.config.js → coverageThreshold.global
  lines:      80%
  branches:   70%
  functions:  80%
  statements: 80%
```

### 覆盖率分析结果

```
📊 覆盖率分析结果
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
文件                    | Stmts | Branch | Funcs | Lines
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ src/utils/parser.js  |  45%  |  30%   |  50%  |  45%
⚠️  src/api/client.js   |  72%  |  65%   |  75%  |  72%
✅ src/models/user.js   |  95%  |  88%   |  100% |  95%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
整体: ❌ 未达标 (lines: 68% < 80%)
```

### 补测建议

```
📝 src/utils/parser.js 补测建议:
  1. parseDate() — 缺少对无效日期格式的测试
     建议: it('should throw when date format is invalid', ...)
  2. formatOutput() 第 45 行 — else 分支未覆盖
     建议: 添加 options.format = 'xml' 的测试用例
  3. validateSchema() — 完全未测试
     建议: 添加 valid/invalid schema 的基础测试
```

## 总结

```
📊 覆盖率总结
  达标文件: 12 个 ✅
  需改进:   5 个 ⚠️
  未达标:   2 个 ❌

💡 优先补测: src/utils/parser.js（当前 45%，差距最大）
```

## 覆盖率指标说明

| 指标 | 说明 |
|------|------|
| Stmts (Statements) | 执行到的语句比例 |
| Branch | 分支覆盖（if/else 每个分支都走到） |
| Funcs (Functions) | 调用到的函数比例 |
| Lines | 代码行覆盖比例 |

## 阈值配置示例

在 `jest.config.js` 中配置：

```javascript
module.exports = {
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 70,
      functions: 80,
      statements: 80
    }
  }
};
```

在 `vitest.config.js` 中配置：

```javascript
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        lines: 80,
        branches: 70,
        functions: 80,
        statements: 80
      }
    }
  }
});
```
---
name: test:review
description: 审查测试文件是否符合方法论，输出评分报告和改进建议
allowed-tools:
  - Read
  - Glob
  - Grep
  - AskUserQuestion
---

<objective>
读取测试文件，从 6 个维度检查是否符合单元测试方法论，输出评分报告和具体改进建议。
</objective>

<rules>
审查维度：
1. AAA 模式 — 每个测试是否有清晰的 Arrange/Act/Assert 结构
2. 测试命名 — 是否描述行为和条件（should X when Y）
3. 覆盖完整性 — 是否包含边界条件和异常路径
4. Mock 合理性 — 是否只 mock 外部依赖，未 mock 内部逻辑
5. 测试独立性 — 是否有共享可变状态或执行顺序依赖
6. 测试纯净性 — 测试中是否有条件逻辑（if/else/switch）
</rules>

<process>
1. 读取目标测试文件
2. 逐维度分析
3. 输出评分报告（✅ 符合 / ⚠️ 需改进 / ❌ 不符合）
4. 对每个问题给出具体的改进示例
</process>

<execution>
## 1. 读取测试文件

用户调用格式：`/test:review <测试文件路径>`

读取文件内容，进行全面分析。

## 2. 逐维度审查

### 维度 1: AAA 模式
检查每个 `it/test` 块是否有清晰的三段结构。

问题信号：
- Act 和 Assert 混在一行（`expect(fn(input)).toBe(x)`）且逻辑复杂
- 没有注释区分三个阶段
- Arrange 阶段在 `beforeEach` 中但与特定测试强耦合

### 维度 2: 测试命名
检查 `it/test` 的描述字符串。

问题信号：
- 名称是 `test1`、`check function`、`works correctly`
- 没有描述预期行为
- 没有说明触发条件

### 维度 3: 覆盖完整性
检查是否有针对边界值的测试。

问题信号：
- 没有 `null`/`undefined` 输入的测试
- 没有空数组/空字符串的测试
- 没有错误路径的测试（`toThrow`）
- 只有一个 happy path 测试

### 维度 4: Mock 合理性
检查 `jest.mock`/`vi.mock` 的使用。

问题信号：
- mock 了项目内部的工具函数
- mock 了被测函数本身的依赖链中的内部模块
- 没有在 `beforeEach` 中 `clearAllMocks`

### 维度 5: 测试独立性
检查共享状态。

问题信号：
- `describe` 块顶层有可变变量被多个测试修改
- 测试依赖上一个测试的副作用
- 没有 `beforeEach` 重置状态

### 维度 6: 测试纯净性
检查测试中的条件逻辑。

问题信号：
- 测试中有 `if`/`else`/`switch`
- 测试中有循环（`for`/`forEach`）用于断言

## 3. 输出报告

```
📊 测试质量报告: <文件名>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ AAA 模式: 结构清晰
⚠️  测试命名: 3 个测试名称不够描述性
❌ 覆盖完整性: 缺少 null/undefined 边界测试
✅ Mock 合理性: 只 mock 了外部 API
⚠️  测试独立性: describe 顶层有共享可变状态
✅ 测试纯净性: 无条件逻辑

总分: 3✅ 2⚠️ 1❌
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 4. 改进建议

对每个 ⚠️ 和 ❌ 项，给出具体的代码示例说明如何改进。

例如，对于命名问题：
```javascript
// ❌ 当前
it('test login', () => { ... })

// ✅ 建议
it('should return token when credentials are valid', () => { ... })
it('should throw AuthError when password is incorrect', () => { ... })
```
</execution>

# test:review

审查测试文件从 6 个维度是否符合单元测试方法论，输出评分报告和具体改进建议。

## 使用方式

```
/test:review <测试文件路径>
```

## 参数

| 参数 | 说明 |
|------|------|
| `测试文件路径` | 要审查的测试文件路径 |

## 示例

```bash
/test:review tests/utils/parser.test.ts
/test:review tests/api/client.test.ts
```

## 审查维度

| # | 维度 | 说明 | 权重 |
|---|------|------|------|
| 1 | AAA 模式 | 每个测试是否有清晰的 Arrange/Act/Assert 结构 | 高 |
| 2 | 测试命名 | 是否描述行为和条件（`should X when Y`） | 高 |
| 3 | 覆盖完整性 | 是否包含边界条件和异常路径 | 高 |
| 4 | Mock 合理性 | 是否只 mock 外部依赖，未 mock 内部逻辑 | 中 |
| 5 | 测试独立性 | 是否有共享可变状态或执行顺序依赖 | 中 |
| 6 | 测试纯净性 | 测试中是否有条件逻辑（if/else/switch） | 低 |

## 输出报告格式

```
📊 测试质量报告: tests/utils/parser.test.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ AAA 模式: 结构清晰
⚠️  测试命名: 3 个测试名称不够描述性
❌ 覆盖完整性: 缺少 null/undefined 边界测试
✅ Mock 合理性: 只 mock 了外部 API
⚠️  测试独立性: describe 顶层有共享可变状态
✅ 测试纯净性: 无条件逻辑

总分: 3✅ 2⚠️ 1❌
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 各维度详解

### 1. AAA 模式

**问题信号：**
- Act 和 Assert 混在一行
- 没有注释区分三个阶段
- Arrange 在 `beforeEach` 中但与特定测试强耦合

### 2. 测试命名

**问题信号：**
- 名称是 `test1`、`check function`、`works correctly`
- 没有描述预期行为
- 没有说明触发条件

**改进示例：**
```typescript
// ❌ 当前
it('test login', () => { ... })

// ✅ 建议
it('should return token when credentials are valid', () => { ... })
it('should throw AuthError when password is incorrect', () => { ... })
```

### 3. 覆盖完整性

**问题信号：**
- 没有 `null`/`undefined` 输入的测试
- 没有空数组/空字符串的测试
- 没有错误路径的测试（`toThrow`）
- 只有一个 happy path 测试

### 4. Mock 合理性

**问题信号：**
- mock 了项目内部的工具函数
- mock 了被测函数依赖链中的内部模块
- 没有在 `beforeEach` 中 `clearAllMocks`

### 5. 测试独立性

**问题信号：**
- `describe` 块顶层有可变变量被多个测试修改
- 测试依赖上一个测试的副作用
- 没有 `beforeEach` 重置状态

### 6. 测试纯净性

**问题信号：**
- 测试中有 `if`/`else`/`switch`
- 测试中有循环用于断言
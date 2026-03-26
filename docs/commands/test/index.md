# Test 命令

单元测试辅助命令集，基于 AAA（Arrange/Act/Assert）模式。

## 命令分类

### 测试生成

| 命令 | 说明 |
|------|------|
| [/test:generate](./generate) | 为指定模块生成单元测试 |
| [/test:snapshot](./snapshot) | 生成快照测试 |

### 测试审查

| 命令 | 说明 |
|------|------|
| [/test:review](./review) | 审查测试质量并给出改进建议 |

### 覆盖率分析

| 命令 | 说明 |
|------|------|
| [/test:coverage](./coverage) | 分析测试覆盖率并给出补测建议 |

## AAA 测试模式

所有命令遵循 AAA（Arrange/Act/Assert）规范：

```
it('should return token when credentials are valid', () => {
  // Arrange - 准备测试数据
  const credentials = { email: 'test@example.com', password: 'correct' };

  // Act - 执行被测操作
  const result = login(credentials);

  // Assert - 验证结果
  expect(result.token).toBe('mock-token');
});
```

## 快速参考

```bash
# 为模块生成测试
/test:generate src/utils/parser.ts

# 生成快照测试
/test:snapshot src/components/UserCard.tsx

# 审查已有测试
/test:review tests/parser.test.ts

# 分析覆盖率
/test:coverage
```

## 相关文档

- [测试方法论](../guide/testing-methodology) - AAA 模式详细说明
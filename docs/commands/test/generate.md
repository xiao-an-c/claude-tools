# test:generate

为指定模块生成基于 AAA 模式的单元测试，覆盖正常路径、边界条件和异常路径。

## 使用方式

```
/test:generate <文件路径>
```

## 参数

| 参数 | 说明 |
|------|------|
| `文件路径` | 目标模块的路径（如 `src/utils/parser.ts`） |

## 示例

```bash
/test:generate src/utils/parser.ts
/test:generate src/api/client.ts
```

## 输出

```
✅ 测试文件已生成: tests/utils/parser.test.ts
📊 覆盖接口: 3 个
📝 测试用例: 9 个（正常: 3 / 边界: 4 / 异常: 2）
💡 运行测试: npm test -- --testPathPattern="parser"
```

## 生成规则

### 测试覆盖维度

| 类型 | 说明 | 示例 |
|------|------|------|
| 正常路径 | 预期的合法输入和输出 | `should return formatted date` |
| 边界条件 | 空值、null、undefined、极值 | `should handle empty string` |
| 异常路径 | 非法输入、错误场景 | `should throw when input is null` |

### AAA 模式

每个测试包含三个明确的阶段：

```typescript
describe('parseDate', () => {
  // 正常路径
  it('should return Date object when given valid ISO string', () => {
    // Arrange
    const input = '2024-01-15T10:30:00Z';

    // Act
    const result = parseDate(input);

    // Assert
    expect(result).toBeInstanceOf(Date);
  });

  // 边界条件
  it('should handle empty string input', () => {
    // Arrange
    const input = '';

    // Act
    const result = parseDate(input);

    // Assert
    expect(result).toBeUndefined();
  });

  // 异常路径
  it('should throw TypeError when input is null', () => {
    // Arrange
    const input = null;

    // Act & Assert
    expect(() => parseDate(input)).toThrow(TypeError);
  });
});
```

### Mock 规范

- **只 mock 外部依赖**：网络请求、文件系统、数据库
- **不 mock 内部逻辑**：被测模块的内部函数直接测试

```typescript
// ✅ 正确：mock 外部 API
jest.mock('../external-api');
const { fetchUser } = require('../external-api');

it('should call API with correct params', async () => {
  fetchUser.mockResolvedValue({ name: 'Alice' });
  const result = await getUserById('123');
  expect(result.name).toBe('Alice');
});

// ❌ 错误：mock 内部工具函数
jest.mock('../internal/utils'); // 不要这样做
```

## 注意事项

- 只测试**公共导出接口**，不测试内部私有方法
- 每个测试**只验证一个行为**，避免复杂测试
- 测试之间**相互独立**，不依赖执行顺序
- 测试中**避免条件逻辑**（if/else/switch）
---
name: test:generate
description: 基于 AAA 模式为指定模块生成覆盖正常/边界/异常路径的单元测试
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
  - Bash
  - AskUserQuestion
---

<objective>
读取目标文件，识别公共接口，按 AAA 模式生成全面的单元测试，覆盖正常路径、边界条件和异常路径。
</objective>

<rules>
测试方法论：
- 每个测试只验证一个行为（单一职责）
- 命名规范：`should <behavior> when <condition>`
- 不测试私有方法，只测试公共接口
- 只 mock 外部依赖（网络、文件 I/O、数据库），不 mock 内部逻辑
- 测试必须独立，不依赖执行顺序
- 避免测试中出现条件逻辑（if/else）

覆盖维度：
1. 正常路径 — 预期的合法输入和输出
2. 边界条件 — 空值、null、undefined、极值、空数组/对象
3. 异常路径 — 非法输入、错误场景
4. 错误处理 — 确保错误被正确抛出
</rules>

<process>
1. 读取目标文件，识别所有导出的公共函数/类/方法
2. 检测测试框架（package.json 中查找 jest/vitest/mocha）
3. 检查是否已有对应测试文件（避免覆盖）
4. 为每个公共接口设计测试用例矩阵
5. 生成测试文件
</process>

<execution>
## 1. 确认目标文件

用户调用格式：`/test:generate <文件路径>`

读取目标文件，分析其导出的公共接口。

## 2. 检测测试框架

```bash
cat package.json | grep -E '"(jest|vitest|mocha|jasmine)"' | head -5
```

根据结果选择对应语法：
- Jest/Vitest: `describe/it/expect`
- Mocha: `describe/it` + `assert` 或 `chai`

## 3. 检查已有测试文件

常见测试文件位置：
- `__tests__/<filename>.test.js`
- `<filename>.test.js`（同级）
- `<filename>.spec.js`（同级）
- `tests/<filename>.test.js`

如果已存在，询问用户：
"已存在测试文件 <路径>，是否追加新测试用例？(y/n)"

## 4. 生成测试文件

测试文件模板（AAA 模式）：

```javascript
// 导入被测模块
const { functionName } = require('./target');
// 或 ES Module: import { functionName } from './target';

describe('functionName', () => {
  // 正常路径
  it('should return expected result when given valid input', () => {
    // Arrange
    const input = 'valid';
    const expected = 'result';

    // Act
    const result = functionName(input);

    // Assert
    expect(result).toBe(expected);
  });

  // 边界条件
  it('should handle empty string input', () => {
    // Arrange
    const input = '';

    // Act
    const result = functionName(input);

    // Assert
    expect(result).toBeDefined();
  });

  it('should handle null input', () => {
    expect(() => functionName(null)).toThrow();
  });

  // 异常路径
  it('should throw error when given invalid input', () => {
    expect(() => functionName(undefined)).toThrow(TypeError);
  });
});
```

对于有外部依赖的模块，添加 mock：

```javascript
// Jest mock 示例
jest.mock('../external-api');
const { fetchData } = require('../external-api');

beforeEach(() => {
  jest.clearAllMocks();
});

it('should call external API with correct params', async () => {
  // Arrange
  fetchData.mockResolvedValue({ data: 'mocked' });

  // Act
  const result = await functionWithDep('param');

  // Assert
  expect(fetchData).toHaveBeenCalledWith('param');
  expect(result).toEqual({ data: 'mocked' });
});
```

## 5. 输出

✅ 测试文件已生成: `<测试文件路径>`
📊 覆盖接口: `<数量>` 个
📝 测试用例: `<数量>` 个（正常: N / 边界: N / 异常: N）
💡 运行测试: `npm test -- --testPathPattern="<文件名>"`
</execution>

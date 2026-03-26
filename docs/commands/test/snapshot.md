# test:snapshot

为指定函数或组件生成快照测试，适用于复杂对象输出和 UI 组件。

## 使用方式

```
/test:snapshot <文件路径>
```

## 参数

| 参数 | 说明 |
|------|------|
| `文件路径` | 目标函数或组件的路径 |

## 示例

```bash
/test:snapshot src/components/UserCard.tsx
/test:snapshot src/utils/config-builder.ts
```

## 适用场景

| 场景 | 说明 | 推荐方式 |
|------|------|----------|
| 复杂对象 | 返回多层嵌套结构 | `toMatchInlineSnapshot` |
| UI 组件 | React/Vue 组件渲染结果 | `toMatchSnapshot` |
| 序列化输出 | JSON、XML、HTML 字符串 | `toMatchInlineSnapshot` |
| 配置对象 | 生成的配置结构 | `toMatchInlineSnapshot` |

## 不适用场景

- 简单的值比较（使用 `toBe` / `toEqual` 更清晰）
- 频繁变化的输出（快照会持续失效）
- 包含随机值或时间戳的输出（需先 mock）

## 生成示例

### React 组件快照

```typescript
import { render } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('should match snapshot with default props', () => {
    const { container } = render(<UserCard name="Alice" role="admin" />);
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot when loading', () => {
    const { container } = render(<UserCard loading />);
    expect(container).toMatchSnapshot();
  });
});
```

### 配置对象快照

```typescript
const { buildConfig } = require('./config-builder');

describe('buildConfig', () => {
  it('should match snapshot for production config', () => {
    const result = buildConfig({ env: 'production' });
    expect(result).toMatchInlineSnapshot(`
      {
        "env": "production",
        "debug": false,
        "timeout": 5000,
        "retry": 3,
      }
    `);
  });
});
```

## 处理动态值

如果输出包含时间戳、随机值等动态内容，需要先 mock：

```typescript
// mock 时间
jest.useFakeTimers();
jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));

// mock 随机值
jest.spyOn(Math, 'random').mockReturnValue(0.5);

// mock UUID
jest.mock('uuid', () => ({ v4: () => 'test-uuid-fixed' }));
```

## 快照文件位置

| 类型 | 位置 |
|------|------|
| `toMatchSnapshot()` | `__snapshots__/<文件名>.snap` |
| `toMatchInlineSnapshot()` | 内联在测试文件中 |

## 更新快照

当输出变化是预期行为时，更新快照：

```bash
# 更新快照
npm test -- --updateSnapshot

# 或
npm test -- -u
```
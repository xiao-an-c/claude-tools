---
name: test:snapshot
description: 为指定函数或组件生成快照测试，适用于复杂对象输出和 UI 组件
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
  - Bash
  - AskUserQuestion
---

<objective>
读取目标函数或组件，生成快照测试（snapshot test），用于捕获输出结构的意外变化。
</objective>

<rules>
快照测试适用场景：
- 返回复杂对象/数组结构的函数
- UI 组件的渲染输出（React/Vue）
- 序列化输出（JSON、XML、HTML 字符串）
- 配置对象生成器

不适用场景：
- 简单的值比较（用 toBe/toEqual 更清晰）
- 频繁变化的输出（快照会持续失效）
- 包含随机值或时间戳的输出（需先 mock）

快照类型选择：
- `toMatchInlineSnapshot()` — 输出较小时优先，快照内联在测试文件中，便于 review
- `toMatchSnapshot()` — 输出较大时使用，快照存储在 `__snapshots__/` 目录
</rules>

<process>
1. 读取目标文件，识别适合快照测试的函数/组件
2. 检测测试框架
3. 处理不确定性（mock 时间、随机值）
4. 生成快照测试文件
5. 提示用户首次运行生成快照基准
</process>

<execution>
## 1. 分析目标文件

用户调用格式：`/test:snapshot <文件路径>`

读取文件，识别：
- 返回复杂对象的函数
- React/Vue 组件
- 包含随机值或时间戳的输出（需要 mock）

## 2. 处理不确定性

如果输出包含动态值，需要先 mock：

```javascript
// mock 时间
jest.useFakeTimers();
jest.setSystemTime(new Date('2024-01-01'));

// mock 随机值
jest.spyOn(Math, 'random').mockReturnValue(0.5);

// mock uuid
jest.mock('uuid', () => ({ v4: () => 'test-uuid-1234' }));
```

## 3. 生成快照测试

### 普通函数快照（inline，输出较小）

```javascript
const { buildConfig } = require('./config-builder');

describe('buildConfig', () => {
  it('should match snapshot for default options', () => {
    const result = buildConfig({ env: 'production' });
    expect(result).toMatchInlineSnapshot(`
      {
        "env": "production",
        "debug": false,
        "timeout": 5000,
      }
    `);
  });
});
```

### 普通函数快照（外部文件，输出较大）

```javascript
it('should match snapshot for full config', () => {
  const result = buildFullConfig({ env: 'production' });
  expect(result).toMatchSnapshot();
});
```

### React 组件快照

```javascript
import { render } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('should match snapshot', () => {
    const { container } = render(
      <UserCard name="Alice" role="admin" />
    );
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot when loading', () => {
    const { container } = render(<UserCard loading />);
    expect(container).toMatchSnapshot();
  });
});
```

### Vue 组件快照

```javascript
import { mount } from '@vue/test-utils';
import UserCard from './UserCard.vue';

it('should match snapshot', () => {
  const wrapper = mount(UserCard, {
    props: { name: 'Alice', role: 'admin' }
  });
  expect(wrapper.html()).toMatchSnapshot();
});
```

## 4. 输出

✅ 快照测试文件已生成: `<测试文件路径>`
📝 测试用例: `<数量>` 个

⚠️  首次运行会自动生成快照基准：
```bash
npm test -- --testPathPattern="<文件名>"
```

💡 更新快照（当输出变化是预期的）：
```bash
npm test -- --updateSnapshot
```

📁 快照文件位置: `__snapshots__/<文件名>.snap`（如使用 toMatchSnapshot）
</execution>

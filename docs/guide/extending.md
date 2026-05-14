# 扩展新类别

Claude Tools 支持扩展新的命令类别和工作流。你可以创建自定义命令集并贡献给社区。

## 创建新命令类别

### 1. 创建目录结构

在项目根目录的 `commands/` 下创建新的类别目录：

```
commands/
├── git/          # 现有 Git 命令
├── test/         # 现有 Test 命令
├── dev/          # 现有 Dev 命令
└── deploy/       # 新类别
    ├── release.md
    └── rollback.md
```

### 2. 创建命令文件

每个命令是一个 Markdown 文件，使用结构化格式编写：

```markdown
---
name: deploy:release
description: 部署发布命令
allowed-tools:
  - Bash
  - AskUserQuestion
---

<objective>
执行部署发布流程
</objective>

<rules>
- 只部署到配置的环境
- 每次部署前必须确认
- 回滚方案必须提前准备
</rules>

<process>
1. 检查部署环境
2. 执行部署
3. 验证部署结果
</process>

<execution>
## 具体执行步骤

1. 读取部署配置
2. 按环境执行部署脚本
3. 运行健康检查
4. 输出部署报告
</execution>
```

### 3. 注册类别描述

在 `bin/cli.js` 的 `getCategoryDescription()` 函数中添加新类别的描述：

```javascript
function getCategoryDescription(category) {
  const descriptions = {
    git: 'Git 工作流命令 (feat/fix/hotfix/release)',
    test: '单元测试命令 (generate/review/coverage/snapshot)',
    dev: '开发工作流命令 (场景驱动：patch/fix/feat/refactor/hotfix/review/discuss/investigate)',
    deploy: '部署命令 (release/rollback)'  // 新增
  };
  return descriptions[category] || `${category} 命令`;
}
```

**注意：** `loadCategories()` 会自动扫描 `commands/` 目录发现新类别，但描述需要手动添加。未添加描述的类别会回退到 `<类别名> 命令`。

### 4. 如果新类别需要 Agent

如果新命令需要 spawn Agent，需要在 `bin/cli.js` 的 `CATEGORY_AGENT_DEPS` 中注册依赖：

```javascript
const CATEGORY_AGENT_DEPS = {
  dev: ['dev-developer', 'dev-planner', 'dev-product', 'dev-recorder', 'dev-tester', 'dev-architect', 'dev-tech-designer', 'dev-workflow-architect'],
  deploy: ['deploy-agent']  // 新增
};
```

**关键约束：新增/修改 Agent 需同步三处：**

1. **`bin/cli.js`** — `CATEGORY_AGENT_DEPS` 映射（手动维护，不会自动发现）
2. **`__tests__/cli.test.js`** — 更新 `loadAgents`、依赖断言、安装相关断言
3. **文档** — 如果 Agent 参与工作流，需更新流程文档

## 创建自定义工作流

工作流是 Markdown 文件，放在 `workflows/` 目录下（包内置）或 `.dev/workflows/` 目录下（项目级）。安装时 `bin/cli.js` 将 `workflows/` 复制到 `.dev/workflows/`（不覆盖已有文件）。

### 工作流文件格式

```yaml
---
name: my-workflow
display_name: "My Workflow"
description: "自定义工作流描述"
category: code-change
defaults:
  use_git: true
  base_branch: develop
  branch_type: feat
---

# Workflow: My Workflow

## 适用场景
...

## 步骤

### Step 1: 解析输入

Type: builtin
Action: parse_arguments
...

### Step 2: 架构分析

Type: agent
Agent: dev-architect
Model: opus
Spawn: inline
...
```

### 步骤类型

| 类型 | 说明 |
|------|------|
| `builtin` | 执行器内置动作（创建分支、初始化状态等） |
| `agent` | spawn 一个 Agent |
| `loop` | 循环执行子步骤 |
| `condition` | 条件执行 |

### 可用 Agent

| Agent | 模型 | 职责 |
|-------|------|------|
| dev-product | opus | 需求讨论、PRD 输出 |
| dev-architect | opus | 架构设计、代码分析 |
| dev-planner | opus | 任务分解 |
| dev-tech-designer | sonnet | 详细技术方案 |
| dev-developer | sonnet | 代码实现 |
| dev-tester | sonnet | 测试设计 |
| dev-recorder | sonnet | 知识记录 |
| dev-workflow-architect | opus | 工作流设计（auto 模式） |

### 调用自定义工作流

创建工作流文件后，通过 `/dev:run <workflow-name>` 调用：

```
/dev:run my-workflow 完成数据库迁移
```

自定义工作流优先于内置工作流（`.dev/workflows/` 优先于包内置的 `workflows/`）。

## 命令文件格式详解

### Frontmatter 字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | 是 | 命令名称，格式：`类别:命令`，如 `deploy:release` |
| `description` | 是 | 简短描述，显示在命令列表中 |
| `allowed-tools` | 是 | 命令可使用的工具列表，参考下方可用工具 |

**可用工具列表：**

| 工具 | 用途 | 示例 |
|------|------|------|
| `Bash` | 执行 shell 命令 | `git status`, `npm test` |
| `Read` | 读取文件内容 | 查看源代码、配置文件 |
| `Write` | 创建新文件 | 生成测试文件、文档 |
| `Edit` | 修改现有文件 | 修复代码、重构 |
| `AskUserQuestion` | 与用户交互 | 确认操作、收集输入 |
| `WebSearch` | 搜索网络信息 | 查找 API 文档 |
| `WebFetch` | 获取 URL 内容 | 读取在线文档 |

### 内容区块说明

| 区块 | 必填 | 说明 |
|------|------|------|
| `<objective>` | 是 | 一句话说明命令的目标 |
| `<rules>` | 否 | 约束规则，让命令行为可预测 |
| `<process>` | 是 | 执行流程概览，给 Claude 理解全局 |
| `<execution>` | 是 | 具体执行步骤 |

## 命令设计原则

### 1. 明确边界

命令应该职责单一。一个好的命令只做一件事，且做得彻底：

```markdown
<!-- 好的例子 -->
<objective>
分析当前分支的 commits 并生成 Release Notes
</objective>

<!-- 不好的例子 -->
<objective>
分析 commits、部署代码、通知团队成员
</objective>
```

### 2. 提供备选路径

考虑用户可能的不同选择：

```markdown
<execution>
1. 检查当前状态
2. 提供选项：
   - 选项 A: 合并并保留分支
   - 选项 B: 合并并删除分支
3. 根据用户选择执行
</execution>
```

### 3. 安全优先

- 破坏性操作前必须确认
- 提供撤销方案
- 防止在保护分支上执行危险操作

### 4. 输出清晰

使用格式化输出让结果一目了然：

```markdown
✅ 成功信息
❌ 错误信息
⚠️  警告信息
💡 提示信息
📊 统计数据
```

## 调试命令

新命令开发过程中，可以通过以下方式调试：

1. **检查格式**: 确保 frontmatter 和区块标记正确闭合
2. **本地测试**: 将命令文件放入 `.claude/commands/` 后直接在 Claude Code 中调用
3. **查看日志**: Claude Code 会显示命令读取情况，观察是否有解析错误

## 提交新命令

如果你是项目贡献者，按以下步骤提交新命令：

1. 在 `commands/` 下创建命令文件
2. 在 `bin/cli.js` 的 `getCategoryDescription()` 中注册类别描述
3. 如果命令需要 Agent，在 `CATEGORY_AGENT_DEPS` 中注册
4. 更新 `__tests__/cli.test.js` 中的相关断言
5. 更新文档
6. 提交 Pull Request

欢迎提交 PR 添加新的命令类别！

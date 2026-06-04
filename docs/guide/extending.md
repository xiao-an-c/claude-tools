# 扩展新技能

Claude Tools 基于 Skills（技能）架构，支持扩展新的命令类别和工作流。你可以创建自定义技能并贡献给社区。

## 创建新技能

### 1. 创建目录结构

在 `skills/` 目录下创建新的技能目录：

```
skills/
├── git-flow/         # 现有 Git Flow 技能
├── dev-flow/         # 现有 Dev Flow 技能
└── my-skill/         # 新技能
    ├── SKILL.md          # 技能定义（必须）
    ├── manifest.json     # 版本和兼容性元数据（必须）
    ├── README.md         # 英文说明（可选）
    ├── README.zh-CN.md   # 中文说明（可选）
    ├── commands/         # 命令文件（可选）
    ├── agents/           # Agent 定义（可选）
    └── workflows/        # 工作流定义（可选）
```

### 2. 创建 SKILL.md

每个技能必须包含 `SKILL.md`，使用 YAML frontmatter + Markdown 格式：

```yaml
---
name: my-skill
description: 触发条件描述，当用户输入匹配时激活此技能
---

# My Skill

技能的详细说明和使用方式。
```

**Frontmatter 字段说明：**

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | 是 | 技能名称，使用 kebab-case 格式，如 `git-flow` |
| `description` | 是 | 触发条件描述，Claude Code 据此判断何时激活此技能 |

### 3. 创建 manifest.json

每个技能必须包含 `manifest.json`，提供版本和兼容性信息：

```json
{
  "name": "my-skill",
  "version": "0.1.0",
  "category": "My Category",
  "description": "技能的简短描述",
  "homepage": "https://github.com/<owner>/<repo>/tree/main/skills/my-skill",
  "compat": ["claude-code"]
}
```

**Manifest 字段说明：**

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | 是 | 技能名称，与 SKILL.md 保持一致 |
| `version` | 是 | 语义化版本号 |
| `category` | 是 | 技能分类 |
| `description` | 是 | 技能简短描述 |
| `homepage` | 是 | 技能主页 URL |
| `compat` | 是 | 兼容平台列表，目前支持 `claude-code` |

### 4. 创建命令文件（可选）

命令放在 `skills/<skill-name>/commands/` 目录下，每个命令是一个 Markdown 文件：

```markdown
---
name: my-skill:action
description: 命令描述
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - AskUserQuestion
---

<objective>
命令的目标
</objective>

<rules>
- 约束规则
</rules>

<process>
执行流程概览
</process>

<execution>
具体执行步骤
</execution>
```

### 5. 创建 Agent 定义（可选）

如果技能需要多 Agent 协作，在 `skills/<skill-name>/agents/` 目录下创建 Agent 定义文件：

```
skills/my-skill/agents/
├── my-agent-planner.md
├── my-agent-developer.md
└── my-agent-reviewer.md
```

### 6. 创建工作流（可选）

工作流放在 `skills/<skill-name>/workflows/` 目录下：

```yaml
---
name: my-workflow
display_name: "My Workflow"
description: "工作流描述"
category: code-change
defaults:
  use_git: true
  base_branch: develop
---

# Workflow: My Workflow

## 适用场景
...

## 步骤

### Step 1: 解析输入

Type: builtin
Action: parse_arguments
...
```

### 7. 注册到插件市场

在 `.claude-plugin/marketplace.json` 的 `plugins` 数组中注册新技能：

```json
{
  "name": "my-skill",
  "description": "新技能的描述",
  "source": "./",
  "strict": false,
  "skills": ["./skills/my-skill"]
}
```

## 命令文件格式详解

### Frontmatter 字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | 是 | 命令名称，格式：`技能名:命令`，如 `my-skill:release` |
| `description` | 是 | 简短描述，显示在命令列表中 |
| `allowed-tools` | 是 | 命令可使用的工具列表 |

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

## 调试技能

新技能开发过程中，可以通过以下方式调试：

1. **检查格式**: 确保 SKILL.md 和 manifest.json 格式正确
2. **本地测试**: 使用 `npx skills add` 从本地路径安装技能
3. **查看日志**: Claude Code 会显示技能加载情况，观察是否有解析错误

## 提交新技能

如果你是项目贡献者，按以下步骤提交新技能：

1. 在 `skills/` 下创建技能目录，包含 SKILL.md 和 manifest.json
2. 添加命令、Agent、工作流等（如需要）
3. 编写 README.md 和 README.zh-CN.md
4. 在 `.claude-plugin/marketplace.json` 中注册技能
5. 更新版本号
6. 提交 Pull Request

欢迎提交 PR 添加新的技能！

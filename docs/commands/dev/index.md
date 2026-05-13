# Dev 命令

场景驱动的多 Agent 协作开发工作流。通过路由器入口 `/dev:start` 自动识别场景，分发到对应的工作流执行。

## 架构

```
/dev:start <描述>
    ↓
路由器匹配工作流（内置 + 已沉淀）
    ↓
/dev:run <workflow>  （通用执行器）
    ↓
读取 .dev/workflows/<workflow>.md → 机械执行步骤
    ↓
spawn Agent 完成 各阶段任务
```

**工作流即知识** — 工作流定义存储在 `.dev/workflows/` 目录中，每个工作流是一个独立的 Markdown 文件。`/dev:run` 作为通用执行器，机械地读取工作流定义并执行其中的步骤。新场景只需新增一个工作流文件。

## 命令总览

### 路由器

| 命令 | 用途 |
|------|------|
| `/dev:start [描述]` | 自动识别场景，匹配工作流并执行 |
| `/dev:start --<mode> [描述]` | 手动指定模式 |
| `/dev:start --run <name>` | 执行指定工作流 |
| `/dev:start --list` | 列出所有可用工作流 |
| `/dev:start --delete <name>` | 删除已沉淀的工作流 |

### 内置工作流

| 命令 | 场景 | 步骤 | Git | 预期耗时 |
|------|------|------|-----|---------|
| [/dev:patch](./patch) | 小修小补，已知原因 | 4 | 无 | 2-3 min |
| [/dev:fix](./fix) | Bug 修复，需诊断 | 10 | `fix/*` | 5-10 min |
| [/dev:feat](./feat) | 新功能开发 | 13 | `feat/*` | 15-45 min |
| [/dev:refactor](./refactor) | 代码重构 | 12 | `refactor/*` | 10-30 min |
| [/dev:hotfix](./hotfix) | 线上紧急修复 | 8 | `hotfix/*` | 5-10 min |
| [/dev:review](./review) | 代码审查 | - | 无（只读） | 5-10 min |
| [/dev:discuss](./discuss) | 架构讨论/开会 | - | 无（只读） | 5-15 min |
| [/dev:investigate](./investigate) | Bug 排查 | - | 无（只读） | 5-10 min |
| [/dev:auto](./auto) | 即兴编排，动态设计 | 5 | 视流程 | 视流程 |

### 辅助命令

| 命令 | 用途 |
|------|------|
| [/dev:status](./status) | 查看当前工作流状态和进度 |
| [/dev:resume](./resume) | 恢复中断的工作流 |

## 工作流定义

每个工作流是一个 Markdown 文件，包含 YAML frontmatter 和步骤定义：

```yaml
---
name: feat
display_name: "Feature Development"
description: "完整功能开发流程"
category: code-change
defaults:
  use_git: true
  base_branch: develop
  branch_type: feat
---
```

步骤使用 4 种原语：

| 原语 | 说明 | 示例 |
|------|------|------|
| `builtin` | 执行器内置动作 | parse_arguments, git_create_branch, verify |
| `agent` | spawn 一个 agent | dev-architect, dev-developer |
| `loop` | 循环执行子步骤 | 开发循环 |
| `condition` | 条件执行 | `complexity == complex` 时才执行 |

## Agent 团队

| Agent | 模型 | 职责 | 使用的模式 |
|-------|------|------|-----------|
| dev-workflow-architect | opus | 工作流设计（auto 模式） | auto |
| dev-product | opus | 需求讨论、PRD 输出 | feat, discuss |
| dev-architect | opus | 架构设计、代码诊断、审查 | 全部模式 |
| dev-planner | opus | 任务分解 | feat, refactor |
| dev-tech-designer | sonnet | 详细技术方案 | feat (复杂) |
| dev-developer | sonnet | 代码实现 | patch, fix, feat, refactor, hotfix |
| dev-tester | sonnet | 测试设计 | feat |
| dev-recorder | sonnet | 知识记录（后台） | 全部模式 |

## 核心原则

1. **工作流即知识** — 工作流定义独立于命令代码，存储在 `.dev/workflows/` 中
2. **通用执行器** — `/dev:run` 机械执行工作流定义，不含业务逻辑
3. **场景驱动** — 每个工作流对应一个真实的开发场景，不搞一刀切
4. **按需 Agent** — patch 用 2 个 Agent，feat 用 5-7 个，按场景组装
5. **文件驱动** — 所有状态写入 `.dev/plan/<branch>/` 目录，不依赖上下文记忆
6. **可沉淀** — auto 模式动态设计的工作流可保存为可复用模板

## 模式衔接

只读模式产出分析文档后，自然衔接到代码修改模式：

```
/dev:investigate 排查 bug -> 建议用 /dev:fix 修复
/dev:discuss 讨论方案 -> 建议用 /dev:feat 实现
/dev:review 审查代码 -> 建议用 /dev:refactor 改进
```

## 分支类型

| 模式 | 分支类型 | 基础分支 |
|------|---------|---------|
| feat | `feat/<slug>` | develop |
| fix | `fix/<slug>` | develop |
| refactor | `refactor/<slug>` | develop |
| hotfix | `hotfix/<slug>` | main/master |
| patch | 无 | - |

## 状态文件

工作流状态存储在 `.dev/plan/<branch-name>/` 目录：

| 文件 | 用途 |
|------|------|
| `WORKFLOW.md` | 动态工作流设计（auto 模式） |
| `PRD.md` | 产品需求文档 / Bug 报告 |
| `TEST-DESIGN.md` | 测试用例设计 |
| `ARCHITECTURE.md` | 架构设计 / 重构分析 |
| `PLAN.md` | 任务分解计划 |
| `TECH-DESIGN.md` | 技术设计 |
| `TASK-LOG.md` | 执行记录 |
| `ACCEPTANCE.md` | 验收说明书 |

## 通用参数

| 参数 | 说明 |
|------|------|
| `--git` | 强制使用 git（创建分支） |
| `--no-git` | 跳过 git，在当前分支工作 |

## 相关命令

- [/git:start-feat](../git/start-feat) - 手动创建功能分支
- [/git:commit](../git/commit) - 智能提交
- [/git:finish](../git/finish) - 完成并合并分支
- [/git:status](../git/status) - 查看 git 分支状态
- [/test:generate](../test/generate) - 手动生成测试

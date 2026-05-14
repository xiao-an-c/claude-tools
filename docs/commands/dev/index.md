# Dev 命令

场景驱动的多 Agent 协作开发工作流。通过 `/dev:run` 通用执行器读取工作流定义，机械执行每个步骤。

## 架构

```
/dev:run <workflow> [--git|--no-git] <描述>
    ↓
读取 .dev/workflows/<workflow>.md → 解析步骤定义
    ↓
按步骤 spawn Agent 完成 各阶段任务
    ↓
产出状态文件 + 验收说明书
```

**工作流即知识** — 工作流定义存储在 `.dev/workflows/` 目录中，每个工作流是一个独立的 Markdown 文件。`/dev:run` 作为通用执行器，机械地读取工作流定义并执行其中的步骤。新场景只需新增一个工作流文件。

## 内置工作流

通过 `/dev:run <workflow-name>` 调用：

| 工作流 | 用途 | 步骤 | Git | 预期耗时 |
|--------|------|------|-----|---------|
| `/dev:run patch` | 小修小补，已知原因 | 4 | 无 | 2-3 min |
| `/dev:run fix` | Bug 修复，需诊断 | 10 | `fix/*` | 5-10 min |
| `/dev:run feat` | 新功能开发 | 13 | `feat/*` | 15-60 min |
| `/dev:run refactor` | 代码重构 | 11 | `refactor/*` | 10-30 min |
| `/dev:run hotfix` | 线上紧急修复 | 8 | `hotfix/*` | 3-5 min |
| `/dev:run auto` | 即兴编排，动态设计 | 6 | 视流程 | 视流程 |

## 独立命令

这些命令不通过工作流执行器，而是独立的 Agent 交互：

| 命令 | 用途 |
|------|------|
| [/dev:review](./review) | 代码审查（只读，无 Git） |
| [/dev:discuss](./discuss) | 架构讨论/开会（只读，无 Git） |
| [/dev:investigate](./investigate) | Bug 排查（只读，无 Git） |
| [/dev:status](./status) | 查看当前工作流状态和进度 |
| [/dev:resume](./resume) | 恢复中断的工作流 |

## 通用执行器

[/dev:run](./run) 是所有工作流的统一入口。它读取工作流定义文件，机械执行每个步骤：

- `builtin` — 执行器内置动作（创建分支、初始化状态、验证等）
- `agent` — spawn 一个 Agent（架构师、开发者等）
- `loop` — 循环执行子步骤（如逐任务开发）
- `condition` — 条件执行（如仅复杂模式执行技术设计）

所有工作流支持 `--git` / `--no-git` 参数。

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

## Agent 团队

| Agent | 模型 | 职责 | 使用的工作流 |
|-------|------|------|-------------|
| dev-product | opus | 需求讨论、PRD 输出 | feat |
| dev-architect | opus | 架构设计、代码诊断 | patch, fix, feat, refactor, hotfix |
| dev-planner | opus | 任务分解 | fix, feat, refactor, hotfix |
| dev-tech-designer | sonnet | 详细技术方案 | feat (complex) |
| dev-developer | sonnet | 代码实现 | patch, fix, feat, refactor, hotfix |
| dev-tester | sonnet | 测试设计 | feat |
| dev-recorder | sonnet | 知识记录（后台） | fix, feat, refactor, hotfix |
| dev-workflow-architect | opus | 工作流设计 | auto |

## 模式衔接

只读模式产出分析文档后，自然衔接到代码修改模式：

```
/dev:investigate 排查 bug -> 建议用 /dev:run fix 修复
/dev:discuss 讨论方案 -> 建议用 /dev:run feat 实现
/dev:review 审查代码 -> 建议用 /dev:run refactor 改进
```

## 分支类型

| 工作流 | 分支类型 | 基础分支 |
|--------|---------|---------|
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

---
name: dev_auto
description: 即兴编排模式（委托给通用执行器）
argument-hint: "[--git|--no-git] <任务描述>"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Agent
  - AskUserQuestion
---

# /dev:auto

委托给通用执行器，使用 auto 工作流。

执行 `commands/dev/run.md` 中的指令，工作流定义为 `.dev/workflows/auto.md`（如果不存在则用 `workflows/auto.md`）。

auto 工作流会：
1. spawn `dev-workflow-architect` 动态设计工作流
2. 用户确认后执行
3. 执行完提议沉淀到 `.dev/workflows/`

透传所有参数：`auto [--git|--no-git] <任务描述>`。

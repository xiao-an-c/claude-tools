---
name: dev_refactor
description: 代码重构模式（委托给通用执行器）
argument-hint: "[--git|--no-git] <重构描述>"
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

# /dev:refactor

委托给通用执行器，使用 refactor 工作流。

执行 `commands/dev/run.md` 中的指令，工作流定义为 `.dev/workflows/refactor.md`（如果不存在则用 `workflows/refactor.md`）。

透传所有参数：`refactor [--git|--no-git] <重构描述>`。

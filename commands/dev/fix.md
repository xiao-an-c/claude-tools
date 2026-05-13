---
name: dev_fix
description: Bug 修复模式（委托给通用执行器）
argument-hint: "[--git|--no-git] <问题描述>"
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

# /dev:fix

委托给通用执行器，使用 fix 工作流。

执行 `commands/dev/run.md` 中的指令，工作流定义为 `.dev/workflows/fix.md`（如果不存在则用 `workflows/fix.md`）。

透传所有参数：`fix [--git|--no-git] <问题描述>`。

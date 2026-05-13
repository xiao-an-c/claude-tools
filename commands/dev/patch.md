---
name: dev_patch
description: 超轻量补丁模式（委托给通用执行器）
argument-hint: "<改动描述>"
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

# /dev:patch

委托给通用执行器，使用 patch 工作流。

执行 `commands/dev/run.md` 中的指令，工作流定义为 `.dev/workflows/patch.md`（如果不存在则用 `workflows/patch.md`）。

透传所有参数：`patch <改动描述>`。

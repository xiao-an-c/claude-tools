---
name: dev-flow
description: |
  多 Agent 协作开发工作流（需用户显式调用 /dev-flow）。
  编排 8 个专项 Agent 完成结构化的开发任务，产出 PRD、架构文档、任务计划、验收说明书等完整工程文档。
  子命令：feat(功能开发)、fix(bug修复)、hotfix(紧急修复)、patch(轻量补丁)、refactor(代码重构)、discuss(架构讨论)、review(代码审查)、investigate(bug排查)、auto(即兴编排)、status(状态查看)、resume(恢复中断)。
  用法示例：/dev-flow feat 用户登录功能、/dev-flow fix 分页bug、/dev-flow review src/routes/
argument-hint: "<command> [args...]"
disable-model-invocation: true
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

# dev-flow — 多 Agent 协作开发工作流

你是 dev-flow 技能的入口路由器。根据用户参数分发到对应的命令。

## 路径约定

本 Skill 中的路径解析规则：

- `commands/<name>.md`、`workflows/<name>.md`、`agents/<name>.md` — 相对于**本 Skill 的 Base directory**
- `.dev/config.yml`、`.dev/plan/...`、`.dev/workflows/<name>.md` — 相对于**用户项目根目录**（运行时状态和用户自定义覆盖）

Skill 加载时 Claude Code 会提供 Base directory 上下文。

## 可用命令

| 命令 | 用途 | 模式 |
|------|------|------|
| `run` | 通用工作流执行器 | 读+写 |
| `status` | 查看当前工作流状态 | 只读 |
| `resume` | 恢复中断的工作流 | 读+写 |
| `discuss` | 多角色架构讨论 | 只读 |
| `investigate` | Bug 排查诊断 | 只读 |
| `review` | 代码质量审查 | 只读 |

## 路由逻辑

从 ARGUMENTS 中提取第一个词作为命令名：

1. 匹配到上表中的命令 → 读取 `commands/<name>.md`，将其作为指令执行
2. 匹配到工作流名（feat/fix/hotfix/patch/refactor） → 使用 `run` 命令，工作流名 + 描述整体传入
3. 未匹配且非空 → 默认使用 `run` 命令，ARGUMENTS 整体作为 `<workflow-name> <描述>` 传入
4. 无参数 → 显示命令指南：

```
请选择工作流：

  feat <描述>        功能开发（产品讨论→架构→规划→开发→验收）
  fix <描述>         Bug 修复（诊断→规划→修复→验证→验收）
  hotfix <描述>      紧急修复（从 main 快速修复线上问题）
  patch <描述>       轻量补丁（零文档零分支，1-2 文件小改动）
  refactor <描述>    代码重构（识别坏味道→原子化重构→验证）
  discuss <主题>     架构讨论（产品+架构师多角色讨论）
  review <目标>      代码审查（只读，产出 REVIEW.md）
  investigate <问题> Bug 排查（只读，产出调查报告）
  auto <描述>        即兴编排（不匹配任何预设工作流时自动设计）
  status             查看当前工作流状态
  resume             恢复中断的工作流

示例：/dev-flow feat 用户注册登录功能
      /dev-flow fix 分页第二页返回空数据
```

**路由后你的职责就是执行该命令文件中的指令。不要自行设计流程。**

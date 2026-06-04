# 指南

欢迎使用 Claude Tools！本指南将帮助你快速上手。

## 什么是 Claude Tools？

Claude Tools 是一个可扩展的 Claude Code 技能集，旨在简化 Git 工作流并提供一致的开发体验。

## 命令类别

### Git 工作流命令

基于 Git Flow 的分支管理，提供完整的开发流程：

| 阶段 | 命令 |
|------|------|
| 初始化 | `git-flow init` |
| 开始工作 | `git-flow start-feat` `git-flow start-fix` `git-flow start-refactor` `git-flow start-hotfix` `git-flow start-release` |
| 日常操作 | `git-flow commit` `git-flow sync` `git-flow wip` `git-flow status` |
| 完成工作 | `git-flow finish` `git-flow publish` `git-flow abort` |

### Dev 开发工作流命令

场景驱动的多 Agent 协作开发。工作流定义存储在 `.dev/workflows/` 中，通过 `dev-flow run` 通用执行器调用：

| 命令 | 用途 |
|------|------|
| `dev-flow run patch <描述>` | 超轻量补丁（零 git 零文档） |
| `dev-flow run fix <描述>` | Bug 诊断 + 修复 |
| `dev-flow run feat <描述>` | 新功能开发（自适应复杂度） |
| `dev-flow run refactor <描述>` | 代码重构 |
| `dev-flow run hotfix <描述>` | 线上紧急修复 |
| `dev-flow run auto <描述>` | 即兴编排（不匹配预设模式时） |
| `dev-flow review` | 代码审查（只读） |
| `dev-flow discuss` | 架构讨论（只读） |
| `dev-flow investigate` | Bug 排查（只读） |
| `dev-flow status` | 查看工作流状态和进度 |
| `dev-flow resume` | 恢复中断的工作流 |

## 架构概览

Claude Tools 基于 **Skills（技能）** 架构——每个技能包含命令文件、Agent 定义和工作流，Claude Code 通过 Skill 触发机制加载并执行。

```
技能调用 (git-flow commit)
    ↓
加载 skills/git-flow/ → 读取 commands/commit.md
    ↓
Claude Code 解析指令并执行
    ↓
返回结果给用户
```

Dev 工作流采用 **工作流即知识** 架构：

```
dev-flow run feat 添加用户登录功能
    ↓
读取 skills/dev-flow/workflows/feat.md → 执行步骤 → spawn Agent
    ↓
产出状态文件 + 验收说明书
```

这种设计使得：
- **新增工作流无需改代码** — 只需添加 Markdown 文件到 `.dev/workflows/`
- **行为完全可控** — 工作流逻辑直接可见
- **经验可沉淀** — auto 模式动态设计的工作流可保存为可复用模板
- **易于分享** — 共享工作流文件即可共享开发经验

## 核心功能

- **Skills 架构**: 基于技能的可扩展架构，通过 `npx skills add` 安装
- **Git Flow 支持**: 完整的功能分支、修复分支、发布分支流程
- **智能提交**: 自动生成符合规范的 commit 信息
- **多 Agent 协作**: 编排 8 个专项 Agent 覆盖完整开发生命周期
- **分支保护**: 防止在 master 等保护分支上误操作

## 下一步

- [快速开始](/guide/getting-started) — 立即开始使用
- [安装详解](/guide/installation) — 了解各种安装方式
- [常见问题](/guide/faq) — 查看常见问题和解决方法
- [扩展新技能](/guide/extending) — 创建自己的技能
- [Git 分支规范](/specs/git-branch-spec) — 查看详细分支管理规范
- [Dev 工作流](/commands/dev/) — 多 Agent 协作开发

# 指南

欢迎使用 Claude Tools！本指南将帮助你快速上手。

## 什么是 Claude Tools？

Claude Tools 是一个可扩展的 Claude Code 命令集，旨在简化 Git 工作流、辅助单元测试，并提供一致的开发体验。

## 命令类别

### Git 工作流命令

基于 Git Flow 的分支管理，提供完整的开发流程：

| 阶段 | 命令 |
|------|------|
| 初始化 | `/git:init` |
| 开始工作 | `/git:start-feat` `/git:start-fix` `/git:start-refactor` `/git:start-hotfix` `/git:start-release` |
| 日常操作 | `/git:commit` `/git:sync` `/git:wip` `/git:status` |
| 完成工作 | `/git:finish` `/git:publish` `/git:abort` |

### Test 辅助命令

基于 AAA（Arrange/Act/Assert）模式的测试工具：

| 命令 | 用途 |
|------|------|
| `/test:generate` | 为模块生成单元测试 |
| `/test:snapshot` | 生成快照测试 |
| `/test:review` | 从 6 个维度审查测试质量 |
| `/test:coverage` | 分析测试覆盖率并给出补测建议 |

### Dev 开发工作流命令

场景驱动的多 Agent 协作开发。工作流定义存储在 `.dev/workflows/` 中，路由器自动匹配工作流，通用执行器 `/dev:run` 机械执行：

| 命令 | 用途 |
|------|------|
| `/dev:start` | 路由器入口，匹配工作流并执行 |
| `/dev:start --run <name>` | 执行指定工作流 |
| `/dev:feat` | 新功能开发（完整团队协作） |
| `/dev:fix` | Bug 诊断 + 修复 |
| `/dev:refactor` | 代码重构 |
| `/dev:patch` | 超轻量补丁（零 git 零文档） |
| `/dev:hotfix` | 线上紧急修复 |
| `/dev:review` | 代码审查（只读） |
| `/dev:discuss` | 架构讨论（只读） |
| `/dev:investigate` | Bug 排查（只读） |
| `/dev:auto` | 即兴编排（不匹配预设模式时） |
| `/dev:status` | 查看工作流状态和进度 |
| `/dev:resume` | 恢复中断的工作流 |

## 架构概览

Claude Tools 基于 **命令文件** 机制工作——每个命令是一个结构化 Markdown 文件，Claude Code 读取后按指令执行。

```
命令调用 (/git:commit)
    ↓
读取 .claude/commands/git/commit.md
    ↓
Claude Code 解析指令并执行
    ↓
返回结果给用户
```

Dev 工作流采用 **工作流即知识** 架构：

```
/dev:start <描述>
    ↓
路由器匹配工作流（内置 + 已沉淀）
    ↓
/dev:run <workflow>  （通用执行器）
    ↓
读取 .dev/workflows/<workflow>.md → 执行步骤 → spawn Agent
```

这种设计使得：
- **新增工作流无需改代码** — 只需添加 Markdown 文件到 `.dev/workflows/`
- **行为完全可控** — 工作流逻辑直接可见
- **经验可沉淀** — auto 模式动态设计的工作流可保存为可复用模板
- **易于分享** — 共享工作流文件即可共享开发经验

## 核心功能

- **选择性安装**: 按需安装需要的命令类别
- **Git Flow 支持**: 完整的功能分支、修复分支、发布分支流程
- **智能提交**: 自动生成符合规范的 commit 信息
- **测试辅助**: 自动生成、审查和覆盖率分析
- **分支保护**: 防止在 master 等保护分支上误操作

## 下一步

- [快速开始](/guide/getting-started) — 立即开始使用
- [安装详解](/guide/installation) — 了解各种安装方式
- [常见问题](/guide/faq) — 查看常见问题和解决方法
- [扩展新类别](/guide/extending) — 创建自己的命令集
- [Git 分支规范](/specs/git-branch-spec) — 查看详细分支管理规范
- [Dev 工作流](/commands/dev/) — 多 Agent 协作开发

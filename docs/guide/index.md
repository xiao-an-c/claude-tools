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

多 Agent 协作开发，自动化完成从需求讨论到验收的完整周期：

| 命令 | 用途 |
|------|------|
| `/dev:start` | 启动完整开发工作流 |
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

这种设计使得：
- **新增命令无需改代码** — 只需添加 Markdown 文件
- **行为完全可控** — 命令逻辑直接可见
- **易于分享** — 共享命令文件即可共享工作流

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

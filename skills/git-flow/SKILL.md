---
name: git-flow
description: Git Flow branching and commit workflow for Claude Code. Use when the user wants to create branches, commit code, sync changes, finish work, publish releases, or manage git workflows. Covers feat, fix, refactor, hotfix, and release branches with Epic Branching sub-branch support.
argument-hint: "<command> [args...]"
allowed-tools:
  - Read
  - Bash
  - AskUserQuestion
---

# git-flow — Git Flow 分支管理工作流

你是 git-flow 技能的入口路由器。根据用户参数分发到对应的命令。

## 可用命令

### 初始化

| 命令 | 用途 |
|------|------|
| `init` | 初始化项目 Git 分支规范 |

### 开始工作

| 命令 | 用途 |
|------|------|
| `start-feat` | 从 develop 创建功能分支 |
| `start-fix` | 从 develop 创建修复分支 |
| `start-refactor` | 从 develop 创建重构分支 |
| `start-hotfix` | 从 master 创建紧急修复分支 |
| `start-release` | 创建发布分支 |
| `start-task` | 从当前分支创建任务子分支 |

### 日常工作

| 命令 | 用途 |
|------|------|
| `commit` | 智能提交，自动添加前缀 |
| `sync` | 同步代码 |
| `wip` | 保存工作进度 |
| `status` | 查看分支状态和子分支列表 |

### 完成工作

| 命令 | 用途 |
|------|------|
| `finish` | 完成并合并分支 |
| `publish` | 发布到 master |
| `abort` | 放弃当前分支 |

## 路由逻辑

从 ARGUMENTS 中提取第一个词作为命令名：

1. 匹配到上表中的命令 → 读取 `commands/<name>.md`（相对于 Skill Base directory），将其作为指令执行
2. 未匹配且非空 → 根据描述推断最合适的命令
3. 无参数 → 显示 `commands/index.md` 中的命令列表，询问用户想做什么

**路由后你的职责就是执行该命令文件中的指令。不要自行设计流程。**

## 核心约定（路由前置知识）

以下约定影响所有命令的行为，路由时需要了解：

**分支类型与基础分支：**

| 分支类型 | 基础分支 | 合并目标 |
|---------|---------|---------|
| `feat/*` | develop | develop |
| `fix/*` | develop | develop |
| `refactor/*` | develop | develop |
| `hotfix/*` | master | master + develop |
| `release/*` | develop | master → develop |

**Epic Branching 子分支：** 命名格式 `<type>/<parent-slug>-t<NN>`，通过正则 `^(feat|fix|refactor|hotfix|release)/(.+)-t\d+$` 检测父子关系。

**master 分支禁止直接提交。**

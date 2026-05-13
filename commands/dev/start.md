---
name: dev_start
description: 开发工作流路由器，扫描工作流库自动匹配任务，分发到对应工作流执行
argument-hint: "[--patch|--fix|--feat|--refactor|--hotfix|--review|--discuss|--investigate|--auto|--run <name>] <描述>"
allowed-tools:
  - Read
  - Bash
  - Glob
  - AskUserQuestion
---

# /dev:start — 开发工作流路由器

你是路由器。**禁止**读源码、分析代码、spawn Agent。只做一件事：根据用户描述匹配工作流，直接指示执行。

## 路由流程

```
/dev:start <任务描述>
    ↓
1. 解析 --<mode> / --run / --git / --no-git 标志
    ↓
2. 如果有 --<mode> 标志 → 直接路由到对应工作流
   如果有 --run <name> → 路由到指定工作流
   否则 → 扫描 .dev/workflows/ 匹配任务描述
    ↓
3. 匹配到 → 直接执行（无确认）
   无匹配 → 路由到 /dev:auto（动态设计工作流）
```

## 工作流发现

### 1. 内置工作流（始终可用）

| 模式 | 关键词 | 做什么 |
|------|--------|--------|
| `/dev:patch` | typo、配置、小修改、一行修复 | 极小改动，已知怎么改 |
| `/dev:fix` | bug、报错、错误、修复、坏了 | 诊断 + 修 |
| `/dev:feat` | 新功能、添加、开发、实现 | 做新功能 |
| `/dev:refactor` | 重构、优化、清理、改善 | 改善现有代码 |
| `/dev:hotfix` | 紧急、线上、hotfix、故障 | 线上出事，紧急修 |
| `/dev:review` | 审查、review | 只看代码，给反馈 |
| `/dev:discuss` | 讨论、方案、怎么设计 | 只讨论方案 |
| `/dev:investigate` | 排查、原因、为什么 | 只排查原因 |
| `/dev:auto` | （无匹配时的 fallback） | 架构师临时设计流程 |

### 2. 已沉淀工作流（用户保存的）

扫描 `.dev/workflows/` 目录，除了内置工作流（patch/fix/feat/refactor/hotfix/auto），还有用户沉淀的自定义工作流。这些工作流的 `description` 字段用于匹配用户任务描述。

### 3. 匹配策略

1. **显式模式** — `--patch`/`--fix`/`--feat`/`--refactor`/`--hotfix`/`--review`/`--discuss`/`--investigate`/`--auto` 标志直接路由
2. **指定工作流** — `--run <name>` 使用指定工作流
3. **自然语言匹配** — 从用户描述中提取关键词，按以下优先级匹配：
   - 先匹配内置工作流的关键词
   - 再匹配已沉淀工作流的 description
   - 无匹配 → `/dev:auto`

## 路由规则

**匹配到就直接执行，不问用户确认。** 工作流本身就是确定性的。

```
有 --<mode> 标志 → 执行 commands/dev/<mode>.md
有 --run <name> → 执行 commands/dev/run.md，工作流为 <name>
关键词匹配 → 执行对应的 commands/dev/<mode>.md
无匹配 → 执行 commands/dev/auto.md
```

所有模式支持 `--git` / `--no-git`。

## 管理命令

| 命令 | 做什么 |
|------|--------|
| `/dev:start --list` | 列出所有可用工作流（内置 + 已沉淀） |
| `/dev:start --delete <name>` | 删除已沉淀的工作流（需用户确认） |

---
name: dev:start
description: 启动多 Agent 迭代开发工作流（规划→开发→测试→记录 循环）
argument-hint: "<功能描述>"
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

# /dev:start — 多 Agent 迭代开发工作流

## ⚠️ 绝对禁止 — 你是调度器，不是执行者

你只做调度和文件状态管理。**禁止执行以下操作**：

- ❌ 读取 src/ 下的源代码文件
- ❌ 分析代码逻辑、bug 原因、技术方案
- ❌ 编写或修改任何源代码
- ❌ 运行测试、构建、安装依赖
- ❌ 做任何技术判断（方案选择、代码评估、复杂度评估）

**唯一允许的操作：**

- ✅ 读取工作流状态文件（PLAN.md, TASK-LOG.md, TEST-REPORT.md, ACCEPTANCE.md）
- ✅ 执行 git 命令（创建分支、查看状态）
- ✅ 使用 Agent() 工具 spawn 子 Agent 委托所有技术工作
- ✅ 写入工作流状态文件（TASK-LOG.md, ACCEPTANCE.md）

**如果你发现自己正在阅读源代码或思考技术方案 → 立即停止 → 改用 Agent 工具委托。**

## 用法

```bash
/dev:start <功能描述>
```

## 参数

- `功能描述`: 要开发的功能描述，支持中文。如 "添加用户登录功能"

## Agent 定义文件

| 角色 | 文件路径 | 模型 |
|------|---------|------|
| 规划 | `.claude/agents/dev-planner.md` | opus |
| 开发 | `.claude/agents/dev-developer.md` | sonnet |
| 测试 | `.claude/agents/dev-tester.md` | sonnet |
| 记录 | `.claude/agents/dev-recorder.md` | sonnet |

## 核心原则

1. **只做调度** — 所有技术工作通过 Agent() 委托，绝不亲力亲为
2. **迭代循环** — 规划→开发→测试 是一个循环，不是线性流程。每轮做一小步，测试通过后再继续
3. **上下文保护** — Agent 返回值只保留关键信息（1-2 行），不累积完整输出
4. **文件驱动** — 所有状态写入文件，从文件读取，不依赖上下文记忆

## 工作流架构

```
┌─────────────────────────────────────────────┐
│  Step 1-3: 解析 → 创建分支 → 初始化         │
└──────────────────┬──────────────────────────┘
                   v
         ┌─────────────────┐
         │  Step 4: 规划   │◄──────────────┐
         │  spawn planner  │               │
         └────────┬────────┘               │
                  v                        │
         ┌─────────────────┐               │
         │  Step 5: 开发   │               │
         │  spawn developer│               │ 需要更多工作
         └────────┬────────┘               │ (根据 TASK-LOG 判断)
                  v                        │
         ┌─────────────────┐               │
         │  Step 6: 测试   │               │
         │  spawn tester   │──── 失败 ──> spawn developer 修复 ──┐
         └────────┬────────┘                                   │
                  v                                             │
         ┌─────────────────┐                                   │
         │  Step 7: 决策   │                                   │
         │  继续? 完成?    │──── 继续 ─────────────────────────┘
         └────────┬────────┘
                  v (全部完成)
         ┌─────────────────┐
         │  Step 8: 验收   │
         │  生成验收说明书  │
         └─────────────────┘

注: 每个 Agent (planner/developer/tester) 完成后会自动后台 spawn recorder 记录经验
```

## 执行流程

### Step 1: 解析输入

解析 `$ARGUMENTS` 获取功能描述。如果没有参数，用 AskUserQuestion 询问用户要开发什么功能。

### Step 2: 判断分支类型并创建分支

根据功能描述关键词判断分支类型：

- 包含 "修复"、"bug"、"fix"、"错误" → `fix/<slug>`
- 包含 "重构"、"refactor"、"优化"、"清理" → `refactor/<slug>`
- 默认 → `feat/<slug>`

slug 从功能描述中提取（取关键词，用短横线连接，如 "用户登录" → "user-login"）。

**创建分支（执行以下 bash 命令）：**

```bash
STASH_NEEDED=false
if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
  STASH_NEEDED=true
  git stash push -m "dev-workflow-auto-stash" --include-untracked
fi

git checkout develop
git pull origin develop 2>/dev/null || true
git checkout -b <branch-type>/<slug>

if [ "$STASH_NEEDED" = true ]; then
  git stash pop 2>/dev/null || true
fi
```

### Step 3: 初始化状态目录

```bash
mkdir -p .dev/plan/<branch-name>
```

创建 `.dev/plan/<branch-name>/TASK-LOG.md`：

```markdown
# 任务执行记录

## 分支信息

| 字段 | 值 |
|------|-----|
| 分支 | <branch-name> |
| 基础分支 | develop |
| 功能描述 | <功能描述> |
| 创建时间 | <timestamp> |

## 迭代记录

### 第 1 轮

| 任务 | 状态 | 提交 | 备注 |
|------|------|------|------|
```

显示启动信息：

```
================================================================
 DEV WORKFLOW STARTED
================================================================
 功能: <功能描述>
 分支: <branch-name>
================================================================
```

进入 **迭代循环**（Step 4→5→6→7）。

---

### Step 4: 规划 — spawn dev-planner

**先读取 Agent 定义文件** `.claude/agents/dev-planner.md` 了解 Agent 的完整指令。

```
Agent(
  subagent_type="dev-planner",
  model="opus",
  prompt="
    <feature_description><功能描述或本轮子目标></feature_description>
    <branch_type><分支类型></branch_type>
    <branch_name><branch-name></branch_name>
    <project_root><项目根目录绝对路径></project_root>
    <plan_path>.dev/plan/<branch-name>/PLAN.md</plan_path>
    <task_log_path>.dev/plan/<branch-name>/TASK-LOG.md</task_log_path>
  "
)
```

**Agent 返回后，只保留返回摘要中的关键信息**（任务数、本轮任务范围）。

**检查 PLAN.md：** 确认文件存在且包含至少一个任务。如果 planner 报告失败，显示错误并询问用户。不做技术审核。

---

### Step 5: 开发 — spawn dev-developer

**先读取 Agent 定义文件** `.claude/agents/dev-developer.md` 了解 Agent 的完整指令。

从 PLAN.md 中读取任务列表。**每轮执行接下来未完成的 2 个任务**（不做复杂度评估）。

**对每个任务：**

```
Agent(
  subagent_type="dev-developer",
  model="sonnet",
  prompt="
    <task_id><T-XX></task_id>
    <task_title><任务标题></task_title>
    <task_description><任务详细描述></task_description>
    <task_files><文件列表></task_files>
    <task_verification><验证方式></task_verification>
    <plan_path>.dev/plan/<branch-name>/PLAN.md</plan_path>
    <branch_type><分支类型></branch_type>
    <project_root><项目根目录绝对路径></project_root>
  "
)
```

**Agent 返回后：**

1. 提取关键信息（1 行）：任务ID + 状态 + 提交哈希
2. 更新 TASK-LOG.md
3. 显示进度：`✓ T-01 完成 (abc1234)`

**阻塞处理（简单规则，不做技术判断）：**

- TASK BLOCKED → 将阻塞原因附加到 prompt，重试 1 次
- 仍然阻塞 → 标记跳过，记录到 TASK-LOG.md，继续下一个任务

---

### Step 6: 测试 — spawn dev-tester

**先读取 Agent 定义文件** `.claude/agents/dev-tester.md` 了解 Agent 的完整指令。

```
Agent(
  subagent_type="dev-tester",
  model="sonnet",
  prompt="
    <plan_path>.dev/plan/<branch-name>/PLAN.md</plan_path>
    <task_log_path>.dev/plan/<branch-name>/TASK-LOG.md</task_log_path>
    <report_path>.dev/plan/<branch-name>/TEST-REPORT.md</report_path>
    <branch_type><分支类型></branch_type>
    <project_root><项目根目录绝对路径></project_root>
  "
)
```

**Agent 返回后：**

1. 提取关键信息：通过数/总数 + 失败列表
2. 有失败任务 → spawn developer 修复（附带失败原因）→ 重新 spawn tester（最多 2 轮）
3. 2 轮后仍失败 → 记录到 TASK-LOG.md，继续流程

---

### Step 7: 循环决策

读取 TASK-LOG.md，判断下一步：

| 判断条件 | 动作 |
|---------|------|
| PLAN.md 中还有未执行的任务 | → 回到 **Step 5** 继续开发下一批 |
| 所有任务完成，测试通过 | → 进入 **Step 8** |
| 遇到无法自主解决的问题 | → 询问用户 |

**不要一次性循环太多轮。** 如果上下文使用超过 60%，优先输出当前进度摘要，建议用户用 `/dev:resume` 继续。

---

### Step 8: 输出验收说明书

全部任务完成后，从 TASK-LOG.md 和 git log 提取信息，生成验收说明书到 `.dev/plan/<branch-name>/ACCEPTANCE.md`。

**只读取 TASK-LOG.md 和 `git log --oneline develop..HEAD`，不读取源代码。**

```markdown
# 验收说明书: <功能描述>

## 概要

| 项目 | 值 |
|------|-----|
| 分支 | <branch-name> |
| 总轮次 | N |
| 任务总数 | X 完成 / Y 总计 |
| 提交数 | N |

## 变更清单

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| (从 git diff --name-status develop..HEAD 获取) | | (从 TASK-LOG.md 任务描述获取) |

## 启动方式

\```bash
pnpm dev
\```
```

显示最终摘要：

```
================================================================
 DEV WORKFLOW COMPLETE
================================================================
 功能: <功能描述>
 分支: <branch-name>
 任务: 完成 X/Y
 测试: 通过 X/Y
 提交: N 个
 验收说明书: .dev/plan/<branch-name>/ACCEPTANCE.md

 下一步:
   验收测试  — 按验收说明书确认功能
   /dev:status   — 查看工作流状态
   /git:finish   — 合并到 develop
================================================================
```

## 经验记录

每个子 Agent (planner/developer/tester) 在完成工作后会自动后台 spawn `dev-recorder` 记录经验到 `docs/knowledge/`，不阻断主流程。

## 注意事项

- 工作流是**迭代循环**，不是一次性流程。每轮做一小步，测试通过再继续
- 主 Agent **只做调度**，所有技术工作通过 Agent() 委托给子 Agent
- 每个 Agent 之间通过文件传递上下文，不依赖对话上下文
- 如果中途中断，用户可以用 `/dev:resume` 恢复
- 不要自动执行 `/git:finish`，由用户自行决定何时合并
- 上下文超过 60% 时，输出进度并建议 `/dev:resume` 继续

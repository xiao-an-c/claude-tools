---
name: dev:start
description: 启动多 Agent 迭代开发工作流（规划→测试设计→开发→验证 循环）
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

- ✅ 读取工作流状态文件（PLAN.md, TASK-LOG.md, TEST-DESIGN.md, ACCEPTANCE.md）
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
| 产品 | `.claude/agents/dev-product.md` | opus |
| 规划 | `.claude/agents/dev-planner.md` | opus |
| 开发 | `.claude/agents/dev-developer.md` | sonnet |
| 测试 | `.claude/agents/dev-tester.md` | sonnet |
| 记录 | `.claude/agents/dev-recorder.md` | sonnet |

## 核心原则

1. **只做调度** — 所有技术工作通过 Agent() 委托，绝不亲力亲为
2. **产品先行** — 先与用户讨论需求、绘制线框图，输出 PRD 后再进入技术规划。这是唯一的人类介入点
3. **先设计再开发** — 规划完成后立即生成测试用例文档，用用户故事+用例明确"要验证什么"，然后才进入开发
4. **逐任务循环** — 开发→验证→决策是一个循环，每轮只做 1 个任务
5. **上下文保护** — Agent 返回值只保留关键信息（1-2 行），不累积完整输出
6. **文件驱动** — 所有状态写入文件，从文件读取，不依赖上下文记忆

## 工作流架构

```
┌─────────────────────────────────────────────┐
│  Step 1-3: 解析 → 创建分支 → 初始化         │
└──────────────────┬──────────────────────────┘
                   v
         ┌─────────────────┐
         │  Step 4: 产品讨论│  一次性，与用户交互
         │  spawn product  │  输出 PRD + 线框图
         └────────┬────────┘  (唯一人类介入点)
                  v
         ┌─────────────────┐
         │  Step 5: 规划   │  一次性，基于 PRD
         │  spawn planner  │
         └────────┬────────┘
                  v
         ┌─────────────────┐
         │  Step 6: 测试设计│  一次性，基于 PLAN.md 生成
         │  spawn tester   │  用户故事 + 测试用例文档
         └────────┬────────┘
                  v
         ┌─────────────────┐
         │  Step 7: 开发   │  每次只做 1 个任务
         │  spawn developer│
         └────────┬────────┘
                  v
         ┌─────────────────┐
         │  Step 8: 验证   │  只验证当前任务
         │  执行验证命令    │── 失败 ──> spawn developer 修复 ──┐
         └────────┬────────┘                                    │
                  v                                              │
         ┌─────────────────┐                                    │
         │  Step 9: 决策   │──────── 还有任务 ─────────────────┘
         │  还有任务?      │  → 回到 Step 7 开发下一个任务
         └────────┬────────┘
                  v (全部完成)
         ┌─────────────────┐
         │  Step 10: 验收  │
         │  生成验收说明书  │
         └─────────────────┘

人类介入: Step 4 (产品讨论) — 唯一与用户交互的环节
初始化阶段: Step 4 (产品) → Step 5 (规划) → Step 6 (测试设计) → 进入循环
循环阶段: Step 7 (开发) → Step 8 (验证) → Step 9 (决策) → 循环
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

进入 **初始化阶段**（Step 4 → Step 5 → Step 6），然后进入 **任务循环**（Step 7 → Step 8 → Step 9 → Step 7 → ...）。

---

### Step 4: 产品讨论 — spawn dev-product（仅执行一次，唯一人类介入点）

**先读取 Agent 定义文件** `.claude/agents/dev-product.md` 了解 Agent 的完整指令。

Product Agent 会与用户讨论需求、澄清交互、绘制线框图，输出 PRD 文档。

```
Agent(
  subagent_type="dev-product",
  model="opus",
  prompt="
    <feature_description><功能描述></feature_description>
    <project_root><项目根目录绝对路径></project_root>
    <prd_path>.dev/plan/<branch-name>/PRD.md</prd_path>
    <plan_path>.dev/plan/<branch-name>/PLAN.md</plan_path>
  "
)
```

**Agent 返回后：**

1. 确认 PRD.md 文件已生成
2. 只保留关键信息：用户故事数、界面数、关键交互决策

**PRD.md 是后续 Step 5 规划的输入依据。**

---

### Step 5: 规划 — spawn dev-planner（仅执行一次，基于 PRD）

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
    <prd_path>.dev/plan/<branch-name>/PRD.md</prd_path>
  "
)
```

**Agent 返回后，只保留返回摘要中的关键信息**（任务数、本轮任务范围）。

**检查 PLAN.md：** 确认文件存在且包含至少一个任务。如果 planner 报告失败，显示错误并询问用户。不做技术审核。

---

### Step 6: 测试设计 — spawn dev-tester（仅执行一次，规划完成后立即执行）

**先读取 Agent 定义文件** `.claude/agents/dev-tester.md` 了解 Agent 的完整指令。

**基于 PLAN.md 生成测试用例文档**，用用户故事 + 测试用例的形式描述每个任务需要验证什么。此时还没有代码，测试设计是"先想清楚要测什么"，不写测试代码。

```
Agent(
  subagent_type="dev-tester",
  model="sonnet",
  prompt="
    <mode>design_only</mode>
    <plan_path>.dev/plan/<branch-name>/PLAN.md</plan_path>
    <test_design_path>.dev/plan/<branch-name>/TEST-DESIGN.md</test_design_path>
    <branch_type><分支类型></branch_type>
    <project_root><项目根目录绝对路径></project_root>
  "
)
```

**Agent 返回后：**

1. 确认 TEST-DESIGN.md 文件已生成
2. 只保留关键信息：用户故事数、测试用例总数、覆盖的任务数

**TEST-DESIGN.md 是后续 Step 7 验证的依据**，developer 在 Step 6 开发时也可以参考。

---

### Step 7: 开发 — spawn dev-developer（每次 1 个任务）

**先读取 Agent 定义文件** `.claude/agents/dev-developer.md` 了解 Agent 的完整指令。

从 PLAN.md 中读取任务列表。**只执行接下来未完成的 1 个任务**。

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
    <test_design_path>.dev/plan/<branch-name>/TEST-DESIGN.md</test_design_path>
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

### Step 8: 验证当前任务

**直接执行当前任务的验证命令**（从 PLAN.md 的验证字段获取），不 spawn tester。

验证方式根据 PLAN.md 中的验证字段决定：

| 验证类型 | 执行方式 |
|---------|---------|
| 单元测试命令 | `Bash("npx vitest run ...")` |
| 构建/类型检查 | `Bash("npx tsc --noEmit")` |
| Playwright E2E | `Bash("npx playwright test ...")` |

**如果验证失败：**

1. spawn developer 修复，附带失败输出
2. 重新执行验证命令（最多 2 轮）
3. 2 轮后仍失败 → 记录到 TASK-LOG.md，标记为 FAILED，继续下一个任务

**如果验证通过：**

记录到 TASK-LOG.md，进入 Step 9。

**验证完成后，后台 spawn recorder 记录验证阶段经验：**

```
Agent(
  subagent_type="dev-recorder",
  model="sonnet",
  run_in_background=true,
  prompt="
    <phase>verification</phase>
    <task_id><T-XX></task_id>
    <branch_name><branch-name></branch_name>
    <project_root><项目根目录绝对路径></project_root>
    <knowledge_dir>docs/knowledge/</knowledge_dir>
    <notes><验证方式、验证结果、遇到的环境/配置问题，如果没有就写 无></notes>
  "
)
```

---

### Step 9: 任务循环决策

读取 TASK-LOG.md，判断下一步：

| 判断条件 | 动作 |
|---------|------|
| PLAN.md 变更日志中有"影响测试设计=是"且未同步 | → spawn dev-tester（design_only）更新 TEST-DESIGN.md，然后回到 **Step 7** |
| PLAN.md 中还有未执行的任务 | → 回到 **Step 7** 开发下一个任务 |
| 所有任务已完成 | → 进入 **Step 10** |
| 遇到无法自主解决的问题 | → 询问用户 |

**TEST-DESIGN.md 同步机制：** 增量规划调整任务后，如果 PLAN.md 变更日志标记了"影响测试设计"，在继续开发前重新 spawn tester（design_only）更新测试设计文档，确保测试用例与最新计划一致。

**循环执行规则：**

- 每轮只处理一个任务（开发 → 验证 → 决策）
- 不要一次性展开所有任务，必须逐个执行
- 每完成一个任务后，停下来判断下一步

**上下文保护：** 如果上下文使用超过 60%，输出当前进度摘要并建议用户用 `/dev:resume` 继续。

---

### Step 10: 输出验收说明书

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

**验收完成后，后台 spawn recorder 记录整体验收经验：**

```
Agent(
  subagent_type="dev-recorder",
  model="sonnet",
  run_in_background=true,
  prompt="
    <phase>acceptance</phase>
    <branch_name><branch-name></branch_name>
    <project_root><项目根目录绝对路径></project_root>
    <knowledge_dir>docs/knowledge/</knowledge_dir>
    <notes><整体开发过程中的经验总结、跨任务的模式发现、工具链配置要点，如果没有就写 无></notes>
  "
)
```

## 经验记录

**每个阶段完成后都必须后台 spawn recorder**，不阻断主流程：

| 阶段 | 触发时机 | 记录内容 |
|------|---------|---------|
| product | Step 4 product 返回后 | 用户偏好、交互决策、功能取舍（由 product 内部触发） |
| planning | Step 5 planner 返回后 | 架构模式、模块关系、依赖特征（由 planner 内部触发） |
| test_design | Step 6 tester 返回后 | 测试策略、覆盖思路（由 tester 内部触发） |
| development | Step 7 developer 返回后 | 代码模式、踩坑经验（由 developer 内部触发） |
| verification | Step 8 验证完成后 | 验证方式、环境配置问题（由编排器触发） |
| acceptance | Step 10 验收完成后 | 整体经验总结（由编排器触发） |

## 注意事项

- 工作流是**先设计再开发**，规划完成后立即生成测试用例文档，明确"要验证什么"后再写代码
- 工作流是**逐任务循环**，不是批量流程。一个任务完成并验证通过后，才开发下一个
- 主 Agent **只做调度**，所有技术工作通过 Agent() 委托给子 Agent
- 验证由主 Agent 直接执行验证命令，不 spawn tester（验证命令在 PLAN.md 中已定义好）
- 每个 Agent 之间通过文件传递上下文，不依赖对话上下文
- 如果中途中断，用户可以用 `/dev:resume` 恢复
- 不要自动执行 `/git:finish`，由用户自行决定何时合并
- 上下文超过 60% 时，输出进度并建议 `/dev:resume` 继续

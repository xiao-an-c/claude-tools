---
name: dev:start
description: 启动多 Agent 团队协作开发工作流（产品→测试设计→架构→规划→技术设计→开发→验证 循环）
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
  - TeamCreate
  - TaskCreate
  - TaskList
  - TaskGet
  - TaskUpdate
  - SendMessage
---

# /dev:start — 多 Agent 团队协作开发工作流

## ⚠️ 绝对禁止 — 你是调度器，不是执行者

你只做调度和文件状态管理。**禁止执行以下操作**：

- ❌ 读取 src/ 下的源代码文件
- ❌ 分析代码逻辑、bug 原因、技术方案
- ❌ 编写或修改任何源代码
- ❌ 运行测试、构建、安装依赖
- ❌ 做任何技术判断（方案选择、代码评估、复杂度评估）

**唯一允许的操作：**

- ✅ 读取工作流状态文件（PLAN.md, TASK-LOG.md, TEST-DESIGN.md, ARCHITECTURE.md, TECH-DESIGN.md, ACCEPTANCE.md）
- ✅ 读取 `.dev/config.yml` 项目配置
- ✅ 执行 git 命令（创建分支、查看状态）
- ✅ 使用 Agent() + TeamCreate + SendMessage + Task* 工具管理团队
- ✅ 写入工作流状态文件（TASK-LOG.md, ACCEPTANCE.md）
- ✅ 写入 `.dev/config.yml`（仅 Step 3 初始化）

**如果你发现自己正在阅读源代码或思考技术方案 → 立即停止 → 改用 Agent 工具委托。**

## 用法

```bash
/dev:start <功能描述>
```

## 参数

- `功能描述`: 要开发的功能描述，支持中文。如 "添加用户登录功能"

## Agent 定义文件

| 角色 | Agent Name | 文件路径 | 模型 | 团队内名 |
|------|-----------|---------|------|---------|
| 产品 | — | `.claude/agents/dev-product.md` | opus | — |
| 架构设计 | `dev-architect` | `.claude/agents/dev-architect.md` | opus | `architect` |
| 规划 | `dev-planner` | `.claude/agents/dev-planner.md` | opus | `planner` |
| 技术设计 | `dev-tech-designer` | `.claude/agents/dev-tech-designer.md` | sonnet | `tech-designer` |
| 开发 | `dev-developer` | `.claude/agents/dev-developer.md` | sonnet | `developer` |
| 测试 | `dev-tester` | `.claude/agents/dev-tester.md` | sonnet | `tester` |
| 记录 | `dev-recorder` | `.claude/agents/dev-recorder.md` | sonnet | `recorder` |

**注意：** Product Agent 不在团队内（需要 AskUserQuestion），以内联方式 spawn。其余 7 个 Agent 作为团队成员加入团队。

## 核心原则

1. **只做调度** — 所有技术工作通过团队 Agent 委托
2. **产品先行** — 先与用户讨论需求，输出 PRD 后再创建团队。这是唯一的人类介入点
3. **团队协作** — Agent 之间通过 SendMessage 自由沟通，但编排器控制流程顺序
4. **任务驱动** — 通过 TaskList/TaskUpdate 管理工作流进度，Agent 完成任务后更新状态
5. **上下文保护** — Agent 返回值只保留关键信息（1-2 行），不累积完整输出
6. **文件驱动** — 所有状态写入文件，团队 Agent 通过文件 + 消息双重传递上下文
7. **配置驱动** — 项目信息通过 `.dev/config.yml` 在各阶段自动发现和传递

## 工作流架构

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1-4: 解析 → 创建分支 → 初始化 config → Product（内联）    │
└──────────────────────────┬──────────────────────────────────────┘
                           v
                 ┌──────────────────────┐
                 │  Step 5: 创建团队     │
                 │  TeamCreate         │
                 │  创建所有任务       │
                 │  spawn 全体成员     │
                 └──────────┬───────┘
                            v
         ┌──────────────────────────────────────────┐
         │  Step 6: 并行 — 测试设计 + 架构设计    │
         │  tester + architect 同时工作              │
         │  可互相 SendMessage 沟通                 │
         └──────────┬───────────────────────────────┘
                    v
         ┌─────────────────┐
         │  Step 7: 架构自审 │  architect 审查自己的输出
         └────────┬────────┘
                  v
         ┌─────────────────┐
         │  Step 8: 任务规划 │  planner ←→ architect 可沟通
         └────────┬────────┘
                  v
         ┌─────────────────┐
         │  Step 9: 技术设计 │  tech-designer ←→ architect 可沟通
         └────────┬────────┘
                  v
         ┌───────────────────────────────────────────┐
         │  Step 10-12: 开发循环                      │
         │  developer ←→ tech-designer/architect 可沟通   │
         │  验证失败 ←→ tester + developer 可协作根因分析  │
         └────────┬───────────────────────────────────┘
                  v (全部完成)
         ┌─────────────────┐
         │  Step 13: 验收   │
         │  /clear 清理     │
         └─────────────────┘

人类介入: Step 4 (产品讨论) — 唯一与用户交互的环节
并行阶段: Step 6 (测试设计 + 架构设计)
协作阶段: Step 8-12 (agent 之间可互相 SendMessage)
```

## 团队通信协议

### 消息格式

所有团队消息使用结构化格式：

```markdown
## <TYPE>: <subject>

<content>

---
team: dev-workflow | phase: <当前阶段> | task: <任务ID>
```

### 消息类型

| 类型 | 场景 | 格式 |
|------|------|------|
| `PHASE_COMPLETE` | Agent 完成阶段任务 | `## PHASE COMPLETE: 测试设计 | 用例数: 12 | 覆盖: 5/8` |
| `QUESTION` | Agent 向另一 Agent 提问 | `## QUESTION: 模块边界 | T-03 的 scope 是否包含 ...` |
| `ANSWER` | 回答问题 | `## ANSWER: 模块边界 | T-03 的 scope 是 ...` |
| `FEEDBACK` | 对另一 Agent 的输出提出反馈 | `## FEEDBACK: PLAN.md 审查 | T-04 拆分粒度过粗` |
| `BLOCKED` | 任务阻塞 | `## BLOCKED: T-05 | 原因: ... | 建议: ...` |
| `HELP_REQUEST` | 请求技术帮助 | `## HELP_REQUEST: 数据流 | 如何处理 ...` |

### 通信矩阵

| 发送者 | 接收者 | 典型场景 |
|--------|--------|---------|
| architect | planner | 模块边界、接口定义、数据流方向 |
| architect | tech-designer | 模块职责、接口契约、设计约束 |
| architect | developer | 架构约束、实现模式、边界处理 |
| planner | architect | 架构澄清、模块关系、依赖方向 |
| tech-designer | architect | 技术选型、实现策略、边界条件 |
| developer | tech-designer | 技术方案不清晰、实现细节 |
| developer | architect | 架构约束冲突、跨模块通信 |
| tester | developer | 测试失败根因分析、复现步骤 |
| developer | tester | 如何复现、测试环境配置 |

## 执行流程

### Step 1: 解析输入

解析 `$ARGUMENTS` 获取功能描述。如果没有参数，用 AskUserQuestion 询问用户要开发什么功能。

### Step 2: 判断分支类型并创建分支

根据功能描述关键词判断分支类型：

- 包含 "修复"、"bug"、"fix"、"错误" → `fix/<slug>`
- 包含 "重构"、"refactor"、"优化"、"清理" → `refactor/<slug>`
- 默认 → `feat/<slug>`

slug 从功能描述中提取（取关键词，用短横线连接，如 "用户登录" → "user-login"）。

**检测 base_branch：** 执行 `git branch --show-current` 获取当前分支。如果是 `develop`、`main` 或 `master`，使用它作为 base_branch。

**创建分支：**

```bash
STASH_NEEDED=false
if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
  STASH_NEEDED=true
  git stash push -m "dev-workflow-auto-stash" --include-untracked
fi

git checkout <base_branch>
git pull origin <base_branch> 2>/dev/null || true
git checkout -b <branch-type>/<slug>

if [ "$STASH_NEEDED" = true ]; then
  git stash pop 2>/dev/null || true
fi
```

### Step 3: 初始化状态目录和项目配置

```bash
mkdir -p .dev/plan/<branch-name>
```

**创建 `.dev/config.yml`：**（完整 schema 见下方附录）

写入 `git` 段（base_branch、current_branch、slug），其余段全部 null。

**创建 `.dev/plan/<branch-name>/TASK-LOG.md`。**

### Step 4: 产品讨论 — 内联 spawn dev-product（唯一人类介入点）

**不创建团队，以内联方式 spawn Product Agent。** 因为 Product 需要 `AskUserQuestion`，必须在主会话中运行。

```
Agent(
  subagent_type="dev-product",
  model="opus",
  prompt="
    <feature_description><功能描述></feature_description>
    <project_root><项目根目录绝对路径></project_root>
    <prd_path>.dev/plan/<branch-name>/PRD.md</prd_path>
    <config_path>.dev/config.yml</config_path>
  "
)
```

**Agent 返回后：**

1. 确认 PRD.md 文件已生成
2. 确认 `.dev/config.yml` 的 `project`、`source_layout`、`architecture` 段已填充
3. 只保留关键信息：用户故事数、项目类型、关键交互决策

---

### Step 5: 创建团队 — 按需 spawn 策略

**创建团队：**

```
TeamCreate(
  team_name="dev-workflow",
  description="开发工作流: <功能描述>"
)
```

**创建所有阶段任务：**

| Task ID | 主题 | 分配给 | 阻塞于 |
|--------|------|--------|--------|
| 1 | 测试设计 | tester | — |
| 2 | 架构设计 | architect | — |
| 3 | 架构自审 | architect | — |
| 4 | 任务规划 | planner | 1, 2, 3 |
| 5 | 技术设计 | tech-designer | 4 |
| 6+ | 开发任务（由 planner 创建） | developer-N | 5 |

```markdown
TaskCreate(subject="测试设计", description="...")
TaskCreate(subject="架构设计", description="...")
TaskCreate(subject="架构自审", description="...")
TaskCreate(subject="任务规划", description="...")
TaskCreate(subject="技术设计", description="...")
TaskUpdate(taskId="4", addBlockedBy=["1", "2", "3"])
TaskUpdate(taskId="5", addBlockedBy=["4"])
```

**按需 spawn 策略：** 不一次性创建所有 agent，只在任务可用时 spawn 对应角色。避免 agent 空闲等待，节省 token。

#### Phase A: spawn architect + tester + recorder（并行阶段）

architect 和 tester 可并行工作，recorder 是被动监听者，三个一起 spawn：

```markdown
TaskUpdate(taskId="1", owner="tester")
TaskUpdate(taskId="2", owner="architect")
```

```
Agent(team_name="dev-workflow", name="architect", subagent_type="dev-architect", model="opus",
     prompt="<project_root>...</project_root><config_path>.dev/config.yml</config_path><architecture_path>.dev/plan/<branch-name>/ARCHITECTURE.md</architecture_path><prd_path>.dev/plan/<branch-name>/PRD.md</prd_path><test_design_path>.dev/plan/<branch-name>/TEST-DESIGN.md</test_design_path> 你是 dev-workflow 团队的架构师。检查 TaskList，如果有分配给你的任务（owner=architect），立即开始工作。工作完成后，更新任务状态为 completed，并通过 SendMessage 通知 team-lead。")

Agent(team_name="dev-workflow", name="tester", subagent_type="dev-tester", model="sonnet",
     prompt="<project_root>...</project_root><config_path>.dev/config.yml</config_path><test_design_path>.dev/plan/<branch-name>/TEST-DESIGN.md</test_design_path> 你是 dev-workflow 团队的测试工程师。检查 TaskList，当有分配给你的任务时开始工作。")

Agent(team_name="dev-workflow", name="recorder", subagent_type="dev-recorder", model="sonnet",
     prompt="<project_root>...</project_root><config_path>.dev/config.yml</config_path> 你是 dev-workflow 团队的经验记录员。当收到 PHASE_COMPLETE 消息时，提取经验并记录到 docs/knowledge/。")
```

#### Phase B: spawn planner（Step 8 前触发）

architect 和 tester 完成后，在 Step 8 开始时 spawn planner：

```
Agent(team_name="dev-workflow", name="planner", subagent_type="dev-planner", model="opus",
     prompt="<project_root>...</project_root><config_path>.dev/config.yml</config_path><plan_path>.dev/plan/<branch-name>/PLAN.md</plan_path><architecture_path>.dev/plan/<branch-name>/ARCHITECTURE.md</architecture_path> 你是 dev-workflow 团队的规划师。检查 TaskList，当有分配给你的任务时开始工作。工作完成后更新任务状态并通知 team-lead。")
```

#### Phase C: spawn tech-designer（Step 9 前触发）

planner 完成后，在 Step 9 开始时 spawn tech-designer：

```
Agent(team_name="dev-workflow", name="tech-designer", subagent_type="dev-tech-designer", model="sonnet",
     prompt="<project_root>...</project_root><config_path>.dev/config.yml</config_path><tech_design_path>.dev/plan/<branch-name>/TECH-DESIGN.md</tech_design_path><plan_path>.dev/plan/<branch-name>/PLAN.md</plan_path><architecture_path>.dev/plan/<branch-name>/ARCHITECTURE.md</architecture_path> 你是 dev-workflow 团队的技术设计师。检查 TaskList，当有分配给你的任务时开始工作。")
```

#### Phase D: spawn developer(s)（Step 10 触发，支持多实例）

tech-designer 完成后，分析 PLAN.md 中的任务依赖关系，识别可并行执行的开发任务组：

**分析规则：**
1. 从 TaskList 获取所有 `status=pending`、`blockedBy=[]` 的开发任务
2. 这些任务之间没有相互依赖，可以并行执行
3. 根据**可并行任务数**决定 spawn 几个 developer 实例

**spawn 规则：**

| 可并行任务数 | developer 实例数 | 策略 |
|-------------|-----------------|------|
| 1 | 1 | 单个 `developer` |
| 2-3 | 2 | `developer-1`, `developer-2` |
| 4+ | 3 | `developer-1`, `developer-2`, `developer-3`（上限 3，避免资源竞争） |

```
Agent(team_name="dev-workflow", name="developer-1", subagent_type="dev-developer", model="sonnet",
     prompt="<project_root>...</project_root><config_path>.dev/config.yml</config_path><plan_path>.dev/plan/<branch-name>/PLAN.md</plan_path><tech_design_path>.dev/plan/<branch-name>/TECH-DESIGN.md</tech_design_path><test_design_path>.dev/plan/<branch-name>/TEST-DESIGN.md</test_design_path> 你是 dev-workflow 团队的开发者 1。检查 TaskList，当有分配给你的任务时开始工作。")

Agent(team_name="dev-workflow", name="developer-2", subagent_type="dev-developer", model="sonnet",
     prompt="<project_root>...</project_root><config_path>.dev/config.yml</config_path><plan_path>.dev/plan/<branch-name>/PLAN.md</plan_path><tech_design_path>.dev/plan/<branch-name>/TECH-DESIGN.md</tech_design_path><test_design_path>.dev/plan/<branch-name>/TEST-DESIGN.md</test_design_path> 你是 dev-workflow 团队的开发者 2。检查 TaskList，当有分配给你的任务时开始工作。")
```

**注意：** 不同 developer 实例不应修改相同文件。分配任务时检查文件路径是否有冲突，如有冲突则串行执行。

**Agent 返回后：** architect 和 tester 开始并行工作。

---

### Step 6: 并行 — 测试设计 + 架构设计

**等待两个 agent 的完成消息。** 编排器收到 tester 和 architect 的 `PHASE COMPLETE` 消息后：

1. 检查 TaskList 确认两个任务都已完成
2. 读取 TEST-DESIGN.md 和 ARCHITECTURE.md 确认文件已生成
3. 只保留关键信息

**处理验证失败：** 如果 tester 或 architect 报告失败，分配修复任务或询问用户。

---

### Step 7: 架构自审

```markdown
TaskUpdate(taskId="3", owner="architect")
SendMessage(to="architect", message="## REVIEW: 架构自审\n\n请审查你刚完成的 ARCHITECTURE.md，检查：\n- PRD 中的功能是否都有模块支撑\n- 测试用例是否都能在架构下执行\n- 模块边界是否清晰、无循环依赖\n\n如果发现问题，直接修正 ARCHITECTURE.md。完成后更新任务状态并通知 team-lead。\n\nteam: dev-workflow | phase: architecture-review | task: T-03")
```

**等待 architect 的 PHASE COMPLETE 消息。**

---

### Step 8: 任务规划

```markdown
TaskUpdate(taskId="4", owner="planner")
SendMessage(to="planner", message="## START: 任务规划\n\n所有前置任务已完成。现在开始基于以下输入进行任务规划：\n- PRD.md\n- TEST-DESIGN.md\n- ARCHITECTURE.md\n\n输出 PLAN.md 到 .dev/plan/<branch-name>/PLAN.md。\n\n完成后更新任务状态并通知 team-lead。\n\nteam: dev-workflow | phase: planning | task: T-04")
```

**等待 planner 的 PHASE COMPLETE 消息。**

**检查 PLAN.md：** 确认文件存在且包含任务。如果 planner 报告失败，显示错误并询问用户。

**处理 planner 创建的开发任务：** planner 在 PLAN.md 中定义的任务需要添加到 TaskList：

```markdown
# 读取 PLAN.md 中的任务列表
# 为每个任务 TaskCreate(subject="Dev: T-XX", description="...")
# 设置依赖: TaskUpdate(taskId=new, addBlockedBy=["5"])  # 技术设计完成后
```

---

### Step 9: 技术设计

```markdown
TaskUpdate(taskId="5", owner="tech-designer")
SendMessage(to="tech-designer", message="## START: 技术设计\n\n基于 PLAN.md 和 ARCHITECTURE.md，为每个任务设计详细技术方案。\n\n输出 TECH-DESIGN.md 到 .dev/plan/<branch-name>/TECH-DESIGN.md。\n\n完成后更新任务状态并通知 team-lead。\n\nteam: dev-workflow | phase: tech-design | task: T-05")
```

**等待 tech-designer 的 PHASE COMPLETE 消息。**

---

### Step 10-12: 开发循环（支持并行）

**分析可并行任务：** 从 TaskList 获取所有 `status=pending`、`blockedBy` 全部完成的开发任务。按依赖关系分组：

```
并行组 = 所有 blockedBy 已完成且 status=pending 的开发任务
```

**如果并行组只有 1 个任务 → 单实例执行（Step 10a）**
**如果并行组有 2+ 个任务 → 多实例并行执行（Step 10b）**

#### Step 10a: 单任务执行

```markdown
TaskUpdate(taskId=taskId, owner="developer-1")
SendMessage(to="developer-1", message="## EXECUTE: <任务ID>: <任务标题>\n\n<任务完整描述>\n\n文件: <文件列表>\n验证: <验证方式>\n\n完成后更新任务状态并通知 team-lead。\n\nteam: dev-workflow | phase: development | task: <taskId>")
```

**等待 developer 的 TASK COMPLETE 或 BLOCKED 消息。** 完成后进入 Step 11 验证。

#### Step 10b: 多任务并行执行

1. **检查文件冲突：** 比较并行任务的文件列表，标记有文件冲突的任务对
2. **分组：** 有冲突的任务串行放入同一 developer；无冲突的任务分配给不同 developer
3. **spawn 不足的 developer 实例**（如果当前 developer 数量不够）
4. **并行分配任务：** 在一条消息中给多个 developer 发送 EXECUTE 消息

```markdown
# 假设 T-11、T-12、T-13 可并行，且无文件冲突
TaskUpdate(taskId=T11, owner="developer-1")
TaskUpdate(taskId=T12, owner="developer-2")
TaskUpdate(taskId=T13, owner="developer-1")  # T-13 等待 T-11 完成后由 developer-1 接手

SendMessage(to="developer-1", message="## EXECUTE: T-11: ...")
SendMessage(to="developer-2", message="## EXECUTE: T-12: ...")
```

**等待所有 developer 的完成消息。** 全部完成后进入 Step 11 逐一验证。

**注意：** developer-1 完成第一个任务后，如果还有排队的任务，编排器发送下一个 EXECUTE 消息。

#### Step 11: 验证

**直接执行验证命令：** 读取 `.dev/config.yml` 的 `verification.commands`。如果为空，从 PLAN.md 验证字段获取。

**如果验证通过：**
1. 更新 TASK-LOG.md
2. 发送 recorder 通知
3. 进入 Step 12

**如果验证失败 — 协作模式：**

1. 发消息给 tester 和 developer，要求协作：
```markdown
SendMessage(to="tester", message="## HELP_REQUEST: 测试失败\n\n任务 <taskId> 验证失败。\n\n失败命令: <command>\n失败输出: <output>\n\n请分析根因，并与 developer 沟通。\n\nteam: dev-workflow | phase: verification | task: <taskId>")
SendMessage(to="developer", message="## HELP_REQUEST: 修复验证失败\n\n任务 <taskId> 验证失败。\n\n失败命令: <command>\n失败输出: <output>\n\ntester 正在分析根因，请协作修复。\n\nteam: dev-workflow | phase: verification | task: <taskId>")
```

2. 等待 tester 的分析结果
3. 根据分析结果，发送修复指令给 developer（或跳过该任务）
4. 重新执行验证

**最多重试 2 轮。** 2 轮后仍失败 → 记录 FAILED 到 TASK-LOG.md，继续下一个任务。

**验证完成后，后台通知 recorder：**
```markdown
SendMessage(to="recorder", message="## PHASE_COMPLETE: verification\n\n任务: <taskId>\n验证方式: <方式>\n验证结果: <通过/失败>\n\nteam: dev-workflow | phase: verification | task: <taskId>")
```

#### Step 12: 任务循环决策

检查 TaskList：

| 判断条件 | 动作 |
|---------|------|
| 还有未执行的开发任务 | → 回到 Step 10 |
| 所有任务已完成 | → 进入 Step 13 |
| 遇到无法自主解决的问题 | → 询问用户 |

**上下文保护：** 如果上下文使用超过 60%，输出进度摘要并建议 `/dev:resume`。

---

### Step 13: 验收 + 清理上下文

**生成验收说明书：** 从 TASK-LOG.md 和 `git log --oneline <base_branch>..HEAD` 提取信息，生成 `.dev/plan/<branch-name>/ACCEPTANCE.md`。

**清理上下文：** 不发送 shutdown、不删除文件。直接执行 `/clear` 清空当前会话上下文，所有 agent 进程自然失效。

**显示最终摘要：**

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
   /git:finish   — 合并到 <base_branch>
================================================================
```

## 附录：.dev/config.yml 完整 Schema

```yaml
# Auto-discovered by agents. NEVER hand-edited.

git:
  base_branch: null
  current_branch: null
  slug: null

project:
  type: null
  language: null
  framework: null
  ui_library: null
  bundler: null
  runtime: null
  dependency_manager: null
  monorepo: false

source_layout:
  root: null
  entry_points: []
  directories: []
  components_dir: null
  hooks_dir: null
  store_dir: null
  services_dir: null
  types_dir: null

architecture:
  patterns: []
  state_management: null
  styling: null
  routing: null

build:
  command: null
  type_check_command: null
  lint_command: null
  dev_command: null

test:
  framework: null
  e2e_framework: null
  unit_command: null
  e2e_command: null
  single_test_command: null
  config_file: null
  e2e_config_file: null
  setup_required: false
  test_environment: null
  e2e_environment: null

verification:
  commands: []

conventions:
  commit_format: null
  scope_mapping: {}
  commit_examples: []
```

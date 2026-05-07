---
name: dev:start
description: 启动多 Agent 协作开发工作流（自动评估复杂度，按 Quick/Standard/Full 三级流程执行）
argument-hint: "[--quick|--standard|--full] <功能描述>"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Agent
  - AskUserQuestion
  - CronCreate
  - CronDelete
  - CronList
  - NotebookEdit
---

# /dev:start — 多 Agent 协作开发工作流

## 绝对禁止 — 你是调度器，不是执行者

你只做调度和文件状态管理。**禁止执行以下操作**：

- 读取 src/ 下的源代码文件
- 分析代码逻辑、bug 原因、技术方案
- 编写或修改任何源代码
- 运行测试、构建、安装依赖
- 做任何技术判断（方案选择、代码评估、复杂度评估）

**唯一允许的操作：**

- 读取工作流状态文件（PLAN.md, TASK-LOG.md, TEST-DESIGN.md, ARCHITECTURE.md, TECH-DESIGN.md, ACCEPTANCE.md）
- 读取 `.dev/config.yml` 项目配置
- 执行 git 命令（创建分支、查看状态）
- 使用 Agent() spawn 各阶段 Agent，通过返回值获取结果
- 写入工作流状态文件（TASK-LOG.md, ACCEPTANCE.md）
- 写入 `.dev/config.yml`（仅 Step 3 初始化）

**如果你发现自己正在阅读源代码或思考技术方案 → 立即停止 → 改用 Agent 工具委托。**

## 用法

```bash
/dev:start [--quick|--standard|--full] <功能描述>
```

## 参数

- `--quick`: 强制使用 Quick 流程（跳过架构设计、测试设计、技术设计）
- `--standard`: 强制使用 Standard 流程（跳过架构自审、技术设计）
- `--full`: 强制使用 Full 流程（完整 13 步）
- `功能描述`: 要开发的功能描述，支持中文。如 "添加用户登录功能"

如果不指定级别，在 Product 阶段后自动评估复杂度并选择最合适的级别。

## Agent 定义文件

| 角色 | Agent Name | 文件路径 | 模型 | Spawn 方式 |
|------|-----------|---------|------|-----------|
| 产品 | — | `.claude/agents/dev-product.md` | opus | 内联 spawn（需要 AskUserQuestion） |
| 架构设计 | `dev-architect` | `.claude/agents/dev-architect.md` | opus | 并行 spawn |
| 规划 | `dev-planner` | `.claude/agents/dev-planner.md` | opus | 按序 spawn |
| 技术设计 | `dev-tech-designer` | `.claude/agents/dev-tech-designer.md` | sonnet | 按序 spawn |
| 开发 | `dev-developer` | `.claude/agents/dev-developer.md` | sonnet | 按任务 spawn（可并行） |
| 测试 | `dev-tester` | `.claude/agents/dev-tester.md` | sonnet | 并行 spawn |
| 记录 | `dev-recorder` | `.claude/agents/dev-recorder.md` | sonnet | 后台 spawn（不阻塞） |

**注意：** Product Agent 需要在主会话中运行（需要 AskUserQuestion），以内联方式 spawn。其余 6 个 Agent 按需 spawn，返回摘要给编排器。

## 核心原则

1. **只做调度** — 所有技术工作通过 Agent() spawn 委托
2. **产品先行** — 先与用户讨论需求，输出 PRD 后再启动工作流。这是唯一的人类介入点
3. **按需分级** — 根据变更规模自动选择 Quick/Standard/Full，避免小任务走重流程
4. **独立执行** — 每个 Agent 独立运行，返回摘要给编排器。编排器通过文件 + 返回值串联上下文
5. **文件驱动** — 所有状态写入文件，Agent 通过文件获取上下文（通过 prompt 中的路径）
6. **上下文保护** — Agent 返回值只保留关键信息（1-2 行），不累积完整输出
7. **配置驱动** — 项目信息通过 `.dev/config.yml` 在各阶段自动发现和传递

## 工作流级别

根据变更规模自动选择工作流级别，用户也可手动指定（`--quick`、`--standard`、`--full`）。

### 级别定义

| 级别 | 触发条件 | 执行步骤 | 预期 Agent 数 |
|------|---------|---------|--------------|
| **Quick** | 单文件修改、hotfix、紧急修复 | Product → 开发 → 验证 → 验收 | 2 (product + developer) |
| **Standard** | 2-5 个文件、fix、小功能、refactor | Product → 测试+架构(并行) → 规划 → 开发 → 验证 → 验收 | 5 (product + tester + architect + planner + developer) |
| **Full** | 大型功能、跨模块、新模块 | 完整 13 步 | 7 (全部) |

### 级别步骤对照

| 步骤 | Quick | Standard | Full |
|------|-------|----------|------|
| Product 讨论 | yes | yes | yes |
| 复杂度评估 | yes | yes | yes |
| 测试设计 | no | yes (简化) | yes |
| 架构设计 | no | yes (简化) | yes |
| 架构自审 | no | no | yes |
| 任务规划 | no (直接执行) | yes | yes |
| 技术设计 | no | no | yes |
| 开发 | yes | yes | yes |
| 验证 | yes | yes | yes |
| 验收 | yes (简化) | yes | yes |

## 工作流架构

```
+------------------------------------------------------------------+
  Step 1-3: 解析+flags -> GitFlow分支 -> 初始化 config
+------------------------------------+-----------------------------+
                                     v
                +--------------------+
                |  Step 4: Product (内联)  |
                |  与用户讨论需求，输出 PRD   |
                +----------+---------+
                           v
                +--------------------+
                |  Step 4.5: 复杂度评估    |
                |  确定 Quick/Standard/Full|
                +----------+---------+
                           v
           +-----------------+------------------+
           v                 v                    v
    +--------------+  +---------------+  +---------------+
    |   Quick      |  |   Standard    |  |     Full      |
    |              |  |               |  |               |
    | spawn dev    |  | test+arch     |  | test+arch     |
    | 直接开发     |  | 并行(简化)    |  | 并行          |
    |              |  |               |  |               |
    |              |  | plan          |  | arch 自审     |
    |              |  |               |  |               |
    |              |  | dev           |  | plan          |
    |              |  |               |  |               |
    |              |  |               |  | tech design   |
    |              |  |               |  |               |
    |              |  |               |  | dev (并行)    |
    +------+------+  +------+--------+  +------+--------+
           v                 v                    v
    +--------------------------------------------------+
    |  Step 13: 验收 + /clear                           |
    +--------------------------------------------------+

人类介入: Step 4 (产品讨论) -- 唯一与用户交互的环节
```

## GitFlow 分支策略

### 分支类型与 base_branch

| 分支类型 | 关键词 | base_branch |
|---------|--------|-------------|
| `hotfix/<slug>` | "紧急修复"、"hotfix" | main/master |
| `release/<slug>` | "发布"、"release" | develop |
| `fix/<slug>` | "修复"、"bug"、"fix"、"错误" | develop |
| `refactor/<slug>` | "重构"、"refactor"、"优化"、"清理" | develop |
| `feat/<slug>` | 默认 | develop |

### 子分支（Epic Branching）

Standard/Full 级别支持子分支，命名规则：`<type>/<slug>-t<NN>`

```
feat/user-auth          <- 集成分支（父分支）
  feat/user-auth-t01    <- 任务子分支 1
  feat/user-auth-t02    <- 任务子分支 2
```

子分支由 dev workflow 的 Step 10 自动创建，验证通过后合并回父分支。
Git 命令通过命名规则 `^(feat|fix|refactor|hotfix|release)/(.+)-t\d+$` 独立检测父子关系。

### 合并策略（完成后）

| 分支类型 | 合并目标 | 额外操作 |
|---------|---------|---------|
| hotfix | main/master + develop | 打 tag |
| release | main/master + develop | 打 tag, 生成 Release Notes |
| fix/refactor/feat | develop | -- |

## 执行流程

### Step 1: 解析输入

解析 `$ARGUMENTS` 获取功能描述和可选的级别标志。

**标志解析：**
- 提取 `--quick`、`--standard`、`--full` 标志（如果存在）
- 从剩余文本中提取功能描述
- 如果没有参数也没有标志，用 AskUserQuestion 询问用户要开发什么功能

**将标志存入变量 `tier_override`：**
- `--quick` -> `tier_override = "quick"`
- `--standard` -> `tier_override = "standard"`
- `--full` -> `tier_override = "full"`
- 未指定 -> `tier_override = null`（自动评估）

### Step 2: 判断分支类型并创建分支

根据功能描述关键词判断分支类型和 base_branch：

| 关键词匹配 | 分支类型 | base_branch |
|-----------|---------|-------------|
| "紧急修复"、"hotfix" | `hotfix/<slug>` | main/master |
| "发布"、"release"、"版本" | `release/<slug>` | develop |
| "修复"、"bug"、"fix"、"错误" | `fix/<slug>` | develop |
| "重构"、"refactor"、"优化"、"清理" | `refactor/<slug>` | develop |
| 默认 | `feat/<slug>` | develop |

slug 从功能描述中提取（取关键词，用短横线连接，如 "用户登录" -> "user-login"）。

**检测 base_branch：** 优先使用上表中的 base_branch。如果当前分支不是目标 base_branch，需要切换。

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

**记录分支类型提示：** `branch_type_hint` 用于复杂度评估（hotfix -> Quick 倾向，release -> Standard 倾向）。

### Step 3: 初始化状态目录和项目配置

```bash
mkdir -p .dev/plan/<branch-name>
```

**创建 `.dev/config.yml`：**（完整 schema 见下方附录）

写入 `git` 段（base_branch、current_branch、slug），写入 `workflow.tier_override`，其余段全部 null。

**创建 `.dev/plan/<branch-name>/TASK-LOG.md`。**

### Step 4: 产品讨论 — 内联 spawn dev-product（唯一人类介入点）

**以内联方式 spawn Product Agent。** 因为 Product 需要 `AskUserQuestion`，必须在主会话中运行。

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

### Step 4.5: 复杂度评估 — 确定工作流级别

**读取 PRD.md 关键信息，评估变更规模。** 不需要读取源代码，只看 PRD 中的用户故事、涉及模块、文件变更范围。评估纯粹基于 PRD 复杂度信号，不与分支类型绑定。

**如果 `tier_override` 已设置（用户指定了标志），直接使用用户选择，跳过自动评估。**

**评估规则（复杂度评分）：**

| 信号 | Quick (0-1分) | Standard (2-4分) | Full (5+分) |
|------|--------------|------------------|-------------|
| 用户故事 | 0-1 | 2-3 | 4+ |
| 预估变更文件 | 1-2 | 3-8 | 9+ |
| 涉及模块 | 1 | 2-3 | 4+ |
| 新依赖 | 无 | 1-2 | 3+ 或 DB migration |
| 新目录/模块 | 否 | 否 | 是 |

每项信号计分，总分 0-1 -> Quick，2-4 -> Standard，5+ -> Full。

**Quick 触发条件（满足任一即可跳过评分）：**
- 用户指定 `--quick`

**Full 触发条件（满足任一即可跳过评分）：**
- 用户指定 `--full`

**将结果写入 `.dev/config.yml`：**

```yaml
workflow:
  tier: quick|standard|full
  tier_source: manual|auto
```

如果 tier 为 Standard 或 Full，同时写入：

```yaml
sub_branches:
  enabled: true
  slug: <branch-slug>      # e.g., "user-auth"
  active: null
  completed: []
  pending: []               # 从 PLAN.md 任务列表填充
  failed: []
```

**向用户显示评估结果：**

```
==================================================
 工作流级别: <Quick/Standard/Full>
 评估依据: <简要说明>
==================================================
```

---

### Step 5: 按级别 spawn Agent

**根据 tier 决定 Agent spawn 策略。不使用团队，编排器直接 spawn Agent 并等待返回值。**

#### Quick 级别

直接进入 Step 10 开发阶段。以内联方式 spawn developer：

```
Agent(
  subagent_type="dev-developer",
  model="sonnet",
  prompt="
    <project_root><项目根目录绝对路径></project_root>
    <config_path>.dev/config.yml</config_path>
    <prd_path>.dev/plan/<branch-name>/PRD.md</prd_path>
    你是开发者。直接根据 PRD.md 实现功能。不需要 PLAN.md 或 TECH-DESIGN.md。
    实现完成后提交代码。
  "
)
```

**Quick 流程直接跳到 Step 10-13。**

#### Standard 级别

**并行 spawn architect + tester：**

```
# 并行 spawn — 两个 Agent 同时运行
Agent(subagent_type="dev-architect", model="opus",
     prompt="<project_root>...</project_root><config_path>.dev/config.yml</config_path><architecture_path>.dev/plan/<branch-name>/ARCHITECTURE.md</architecture_path><prd_path>.dev/plan/<branch-name>/PRD.md</prd_path> Standard 模式：生成简化版架构设计，聚焦模块划分和关键接口。")

Agent(subagent_type="dev-tester", model="sonnet",
     prompt="<project_root>...</project_root><config_path>.dev/config.yml</config_path><test_design_path>.dev/plan/<branch-name>/TEST-DESIGN.md</test_design_path> Standard 模式：生成简化版测试设计，只覆盖主要功能路径。")

# 等待两者返回摘要
```

**等待两个 Agent 返回。** 确认 ARCHITECTURE.md 和 TEST-DESIGN.md 已生成。然后进入 Step 8（跳过 Step 7）。

#### Full 级别

**按需 spawn 策略：** 不一次性创建所有 Agent，只在对应步骤时 spawn 对应角色。

##### Phase A: 并行 spawn architect + tester + recorder

```
# 并行 spawn — 三个 Agent 同时运行
Agent(subagent_type="dev-architect", model="opus",
     prompt="<project_root>...</project_root><config_path>.dev/config.yml</config_path><architecture_path>.dev/plan/<branch-name>/ARCHITECTURE.md</architecture_path><prd_path>.dev/plan/<branch-name>/PRD.md</prd_path><test_design_path>.dev/plan/<branch-name>/TEST-DESIGN.md</test_design_path> 你是架构师。生成完整版架构设计。")

Agent(subagent_type="dev-tester", model="sonnet",
     prompt="<project_root>...</project_root><config_path>.dev/config.yml</config_path><test_design_path>.dev/plan/<branch-name>/TEST-DESIGN.md</test_design_path> 你是测试工程师。生成完整版测试设计。")

Agent(subagent_type="dev-recorder", model="sonnet", run_in_background=true,
     prompt="<project_root>...</project_root><config_path>.dev/config.yml</config_path> 你是经验记录员。等待后续通知。")
```

**等待 architect 和 tester 返回。** recorder 后台运行不阻塞。

##### Phase B: spawn planner（Step 8 前触发）

```
Agent(subagent_type="dev-planner", model="opus",
     prompt="<project_root>...</project_root><config_path>.dev/config.yml</config_path><plan_path>.dev/plan/<branch-name>/PLAN.md</plan_path><architecture_path>.dev/plan/<branch-name>/ARCHITECTURE.md</architecture_path><prd_path>.dev/plan/<branch-name>/PRD.md</prd_path><test_design_path>.dev/plan/<branch-name>/TEST-DESIGN.md</test_design_path> 你是规划师。基于 PRD + TEST-DESIGN + ARCHITECTURE 进行任务规划，输出 PLAN.md。")
```

##### Phase C: spawn tech-designer（Step 9 前触发）

```
Agent(subagent_type="dev-tech-designer", model="sonnet",
     prompt="<project_root>...</project_root><config_path>.dev/config.yml</config_path><tech_design_path>.dev/plan/<branch-name>/TECH-DESIGN.md</tech_design_path><plan_path>.dev/plan/<branch-name>/PLAN.md</plan_path><architecture_path>.dev/plan/<branch-name>/ARCHITECTURE.md</architecture_path> 你是技术设计师。基于 PLAN.md 和 ARCHITECTURE.md，为每个任务设计详细技术方案。")
```

##### Phase D: spawn developer(s)（Step 10 触发，支持多实例）

tech-designer 完成后，分析 PLAN.md 中的任务依赖关系，识别可并行执行的开发任务组：

**分析规则：**
1. 从 PLAN.md 获取所有可执行的开发任务（依赖已完成）
2. 这些任务之间没有相互依赖，可以并行执行
3. 根据**可并行任务数**决定 spawn 几个 developer 实例

**spawn 规则：**

| 可并行任务数 | developer 实例数 | 策略 |
|-------------|-----------------|------|
| 1 | 1 | 单个 developer |
| 2-3 | 2 | 并行 spawn 2 个 |
| 4+ | 3 | 并行 spawn 3 个（上限 3，避免资源竞争） |

```
Agent(subagent_type="dev-developer", model="sonnet",
     prompt="<project_root>...</project_root><config_path>.dev/config.yml</config_path><plan_path>.dev/plan/<branch-name>/PLAN.md</plan_path><tech_design_path>.dev/plan/<branch-name>/TECH-DESIGN.md</tech_design_path><test_design_path>.dev/plan/<branch-name>/TEST-DESIGN.md</test_design_path> 你是开发者 1。任务: <任务描述>。文件: <文件列表>。")
```

**注意：** 不同 developer 实例不应修改相同文件。分配任务时检查文件路径是否有冲突，如有冲突则串行执行。

---

### Step 6: 等待 Agent 返回 — 测试设计 + 架构设计 [Standard, Full]

**Quick 级别跳过此步骤。**

**等待并行 spawn 的 Agent 返回。** architect 和 tester 完成后：

1. 确认 TEST-DESIGN.md 和 ARCHITECTURE.md 文件已生成
2. 只保留关键信息（1-2 行摘要）

**处理失败：** 如果 Agent 返回失败摘要，分析原因并决定是否重试或询问用户。

**Standard 级别：** 简化版测试设计和架构设计，直接进入 Step 8（跳过 Step 7）。

---

### Step 7: 架构自审 [Full only]

**Quick 和 Standard 级别跳过此步骤。**

**再次 spawn architect，prompt 中包含自审要求：**

```
Agent(subagent_type="dev-architect", model="opus",
     prompt="<project_root>...</project_root><config_path>.dev/config.yml</config_path><architecture_path>.dev/plan/<branch-name>/ARCHITECTURE.md</architecture_path><prd_path>.dev/plan/<branch-name>/PRD.md</prd_path><test_design_path>.dev/plan/<branch-name>/TEST-DESIGN.md</test_design_path> 你是架构师。请审查你之前生成的 ARCHITECTURE.md，检查：
- PRD 中的功能是否都有模块支撑
- 测试用例是否都能在架构下执行
- 模块边界是否清晰、无循环依赖

如果发现问题，直接修正 ARCHITECTURE.md。完成后返回摘要。")
```

**等待 architect 返回。** 确认 ARCHITECTURE.md 已更新。

---

### Step 8: 任务规划 [Standard, Full]

**Quick 级别跳过此步骤（直接进入开发）。**

**spawn planner：**

```
Agent(subagent_type="dev-planner", model="opus",
     prompt="<project_root>...</project_root><config_path>.dev/config.yml</config_path><plan_path>.dev/plan/<branch-name>/PLAN.md</plan_path><architecture_path>.dev/plan/<branch-name>/ARCHITECTURE.md</architecture_path><prd_path>.dev/plan/<branch-name>/PRD.md</prd_path><test_design_path>.dev/plan/<branch-name>/TEST-DESIGN.md</test_design_path> 你是规划师。基于以下输入进行任务规划：
- PRD.md
- TEST-DESIGN.md
- ARCHITECTURE.md

输出 PLAN.md 到 .dev/plan/<branch-name>/PLAN.md。")
```

**等待 planner 返回。**

**检查 PLAN.md：** 确认文件存在且包含任务列表。

---

### Step 9: 技术设计 [Full only]

**Quick 和 Standard 级别跳过此步骤。**

**spawn tech-designer：**

```
Agent(subagent_type="dev-tech-designer", model="sonnet",
     prompt="<project_root>...</project_root><config_path>.dev/config.yml</config_path><tech_design_path>.dev/plan/<branch-name>/TECH-DESIGN.md</tech_design_path><plan_path>.dev/plan/<branch-name>/PLAN.md</plan_path><architecture_path>.dev/plan/<branch-name>/ARCHITECTURE.md</architecture_path> 你是技术设计师。基于 PLAN.md 和 ARCHITECTURE.md，为每个任务设计详细技术方案。

输出 TECH-DESIGN.md 到 .dev/plan/<branch-name>/TECH-DESIGN.md。")
```

**等待 tech-designer 返回。** 确认 TECH-DESIGN.md 已生成。

---

### Step 10-12: 开发循环（支持并行 + 子分支）

**所有级别都执行此步骤，但方式不同。**

#### Quick 级别的开发

developer Agent 直接根据 PRD.md 实现功能。不需要 PLAN.md 或 TECH-DESIGN.md。直接在集成分支上工作，不创建子分支。

developer 完成后直接进入 Step 11 验证。

#### Standard / Full 级别的开发（使用子分支）

Standard/Full 级别使用子分支（Epic Branching）。每个任务创建一个子分支，验证通过后合并回集成分支。

**子分支命名：** `<type>/<slug>-t<NN>`，如 `feat/user-auth-t01`

**分析可并行任务：** 从 PLAN.md 读取任务列表，获取所有依赖已完成的开发任务。

**如果并行组只有 1 个任务 -> 单实例执行（Step 10a）**
**如果并行组有 2+ 个任务 -> 多实例并行执行（Step 10b）**

##### Step 10: 创建子分支 + spawn developer

**对于每个任务（或并行任务组）：**

1. **从集成分支创建子分支：**
   ```bash
   git checkout <integration-branch>
   git checkout -b <type>/<slug>-t<NN>
   ```
   编号从已有子分支中自动递增。

2. **更新 config：** `sub_branches.active = "<type>/<slug>-t<NN>"`

3. **spawn developer 并传入任务描述：**

```
Agent(subagent_type="dev-developer", model="sonnet",
     prompt="<project_root>...</project_root><config_path>.dev/config.yml</config_path><plan_path>.dev/plan/<branch-name>/PLAN.md</plan_path><tech_design_path>.dev/plan/<branch-name>/TECH-DESIGN.md</tech_design_path><test_design_path>.dev/plan/<branch-name>/TEST-DESIGN.md</test_design_path> 你是开发者。任务: <任务ID>: <任务标题>。描述: <任务完整描述>。文件: <文件列表>。验证: <验证方式>。实现完成后提交代码。")
```

##### Step 10b: 多任务并行执行

1. **检查文件冲突：** 比较并行任务的文件列表
2. **为每个任务创建子分支：**
   ```bash
   git checkout <integration-branch>
   git checkout -b <type>/<slug>-t<NN-1>
   git checkout <integration-branch>
   git checkout -b <type>/<slug>-t<NN-2>
   ```
3. **分组：** 有冲突的任务串行；无冲突的任务并行 spawn 不同 developer
4. **并行 spawn developer**

##### Step 11: 验证

**直接执行验证命令：** 读取 `.dev/config.yml` 的 `verification.commands`。如果为空，从 PLAN.md 验证字段获取。

**如果验证通过：**
1. 进入 Step 11.5 合并子分支

**如果验证失败 — 协作模式（Standard/Full）：**

1. 将验证失败输出作为 prompt 上下文，再次 spawn developer 要求修复
2. 最多重试 2 轮
3. 仍失败 -> 记录 FAILED，进入 Step 11.5 清理子分支

##### Step 11.5: 合并/清理子分支 [Standard, Full]

**验证通过：**
```bash
git checkout <integration-branch>
git merge <type>/<slug>-t<NN> --no-ff -m "Merge <type>/<slug>-t<NN>: <任务标题>"
git branch -d <type>/<slug>-t<NN>
```
更新 config：`sub_branches.active = null`，追加到 `sub_branches.completed`。

**验证永久失败：**
```bash
git checkout <integration-branch>
git branch -D <type>/<slug>-t<NN>
```
更新 config：追加到 `sub_branches.failed`。

**合并冲突处理：**
```bash
git merge --abort
git checkout <type>/<slug>-t<NN>
git rebase <integration-branch>
# 解决冲突后
git checkout <integration-branch>
git merge <type>/<slug>-t<NN> --no-ff
```

更新 TASK-LOG.md。

#### Step 12: 任务循环决策

检查 PLAN.md 中的任务列表（Standard/Full）或检查 developer 是否完成（Quick）：

| 判断条件 | 动作 |
|---------|------|
| 还有未执行的开发任务 | -> 回到 Step 10 |
| 所有任务已完成 | -> 进入 Step 13 |
| 遇到无法自主解决的问题 | -> 询问用户 |

**上下文保护：** 如果上下文使用超过 60%，输出进度摘要并建议 `/dev:resume`。

---

### Step 13: 验收 + 清理上下文

**生成验收说明书：** 从 TASK-LOG.md 和 `git log --oneline <base_branch>..HEAD` 提取信息，生成 `.dev/plan/<branch-name>/ACCEPTANCE.md`。

**Quick 级别：** 简化验收，只记录变更摘要和验证结果。

**Standard/Full 级别：** 完整验收说明书，包含任务列表、测试结果、提交记录。

**清理上下文：** 不发送 shutdown、不删除团队、不删除文件。直接执行 `/clear` 清空当前会话上下文，所有 Agent 进程自然失效。

**显示最终摘要：**

```
================================================================
 DEV WORKFLOW COMPLETE
================================================================
 功能: <功能描述>
 级别: <Quick/Standard/Full>
 分支: <branch-name>
 任务: 完成 X/Y
 测试: 通过 X/Y
 提交: N 个
 验收说明书: .dev/plan/<branch-name>/ACCEPTANCE.md

 下一步:
   验收测试  -- 按验收说明书确认功能
   /dev:status   -- 查看工作流状态
   /git:finish   -- 合并到 <base_branch>
================================================================
```

## 附录：.dev/config.yml 完整 Schema

```yaml
# Auto-discovered by agents. NEVER hand-edited.

git:
  base_branch: null
  current_branch: null
  slug: null
  branch_type: null  # feat/fix/refactor/hotfix/release

workflow:
  tier: null           # quick/standard/full
  tier_source: null    # manual (user flag) or auto (detected)

sub_branches:
  enabled: false       # true for Standard/Full
  slug: null           # e.g., "user-auth" (from integration branch)
  active: null         # current sub-branch being worked on
  completed: []        # merged sub-branch names
  pending: []          # task IDs not yet started
  failed: []           # task IDs that permanently failed verification

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

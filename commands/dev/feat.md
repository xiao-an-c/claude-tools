---
name: dev_feat
description: 新功能开发模式，完整团队协作（产品+架构+测试+规划+开发），自适应复杂度，支持 --git/--no-git
argument-hint: "[--git|--no-git] <功能描述>"
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

# /dev:feat — 新功能开发模式

旗舰级功能开发命令，自适应复杂度，完整团队协作。替代原 `/dev:start` 的 Standard 和 Full 级别。

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
- 写入 `.dev/config.yml`（仅 Step 3 初始化和 Step 5 复杂度评估）

**如果你发现自己正在阅读源代码或思考技术方案 → 立即停止 → 改用 Agent 工具委托。**

## 用法

```bash
/dev:feat [--git|--no-git] <功能描述>
```

## 参数

- `--git`: 启用 git 分支管理（默认行为）。创建 `feat/<slug>` 分支、子分支，支持提交和合并
- `--no-git`: 禁用 git 操作。不创建分支、不提交代码。适用于不想产生 git 历史的场景
- `功能描述`: 要开发的功能描述，支持中文。如 "添加用户登录功能"

如果不指定 `--git` 或 `--no-git`，默认 `use_git=true`。

## 核心设计

### 自适应复杂度

**不在开始时决定复杂度。** 在架构设计 + 测试设计完成后（此时已有足够信息），再评估：

| 维度 | 简单 (simple) | 复杂 (complex) |
|------|--------------|----------------|
| 用户故事 | 1-3 | 4+ |
| 预估变更文件 | 1-3 | 4+ |
| 是否涉及新模块 | 否 | 是 |

评估结果决定后续路径：
- **简单** — 跳过技术设计，直接进入开发
- **复杂** — 架构师自审 → 技术设计 → 开发

### Agent 列表

| 角色 | Agent Name | 模型 | Spawn 方式 |
|------|-----------|------|-----------|
| 产品 | `dev-product` | opus | 内联 spawn（需要 AskUserQuestion） |
| 架构设计 | `dev-architect` | opus | 并行 spawn |
| 测试设计 | `dev-tester` | sonnet | 并行 spawn |
| 规划 | `dev-planner` | opus | 按序 spawn |
| 技术设计 | `dev-tech-designer` | sonnet | 按序 spawn（仅 complex） |
| 开发 | `dev-developer` | sonnet | 按任务 spawn（可并行，最多 3） |
| 记录 | `dev-recorder` | sonnet | 内联 spawn（每任务完成后） |

### 产物文件

所有产物输出到 `.dev/plan/<branch-name>/`（`use_git=true`）或 `.dev/plan/feat-<slug>/`（`use_git=false`）：

```
PRD.md → TEST-DESIGN.md + ARCHITECTURE.md → PLAN.md → [TECH-DESIGN.md] → TASK-LOG.md → ACCEPTANCE.md
```

## 工作流架构

```
+------------------------------------------------------------------+
  Step 1: 解析输入 (提取 --git/--no-git 和功能描述)
+------------------------------------+-----------------------------+
                                     v
+------------------------------------------------------------------+
  Step 2: 创建分支 (use_git=true) 或 生成 slug (use_git=false)
+------------------------------------+-----------------------------+
                                     v
+------------------------------------------------------------------+
  Step 3: 初始化状态目录 + config.yml
+------------------------------------+-----------------------------+
                                     v
                +--------------------+
                |  Step 4: Product (内联, opus) |
                |  与用户讨论需求，输出 PRD      |
                |  ★ 唯一人类交互点              |
                +----------+---------+
                           v
                +--------------------+
                |  Step 5: 复杂度评估         |
                |  读取 PRD，判断 simple/complex |
                +----------+---------+
                           v
           +----------------+------------------+
           v                v
    +---------------+  +---------------+
    |  Step 6: 并行    |  |               |
    |  tester (sonnet) |  |               |
    |  architect (opus)|  |               |
    +-------+--------+  +-------+--------+
            v                    v
    +--------------------+
    |  Step 7: 规划        |
    |  planner (opus)     |
    +----------+---------+
               v
       +-------+--------+
       v                v
  ┌──────────┐   ┌──────────────┐
  │  Simple   │   │   Complex     │
  │  跳过技术  │   │  Step 8a:     │
  │  设计      │   │  架构自审     │
  │           │   │              │
  │           │   │  Step 8b:     │
  │           │   │  技术设计     │
  └────+──────┘   └──────+───────┘
       v                  v
  +--------------------------------------------------+
  |  Step 9: 开发循环                                  |
  |  分析并行任务 → spawn developer(s) → 子分支       |
  |  每任务完成后 → Step 10: recorder                  |
  |  循环直到所有任务完成                               |
  +--------------------------------------------------+
               v
  +--------------------------------------------------+
  |  Step 11: 验证 (build/lint/test)                  |
  +--------------------------------------------------+
               v
  +--------------------------------------------------+
  |  Step 12: 验收 → ACCEPTANCE.md                    |
  +--------------------------------------------------+
               v
  +--------------------------------------------------+
  |  Step 13: 显示摘要，建议 /git:finish              |
  +--------------------------------------------------+

人类介入: Step 4 (产品讨论) — 唯一与用户交互的环节
```

## .dev/config.yml Schema

```yaml
# Auto-discovered by agents. NEVER hand-edited.

git:
  base_branch: null
  current_branch: null
  slug: null
  branch_type: null  # feat/fix/refactor/hotfix/release

workflow:
  mode: feat
  complexity: null    # simple / complex
  use_git: true       # --git or --no-git

sub_branches:
  enabled: false       # true when use_git=true and complexity=complex
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

## 执行流程

### Step 1: 解析输入

解析 `$ARGUMENTS` 获取功能描述和 git 标志。

**标志解析：**
- 提取 `--git` 标志 → `use_git = true`（默认值，可省略）
- 提取 `--no-git` 标志 → `use_git = false`
- 从剩余文本中提取功能描述
- 如果没有参数，用 AskUserQuestion 询问用户要开发什么功能

**slug 生成：**
- 从功能描述中提取关键词
- 用短横线连接，转为英文或拼音
- 如 "用户登录功能" → `user-login`

### Step 2: 创建分支

**根据 `use_git` 决定是否执行 git 操作。**

#### use_git = true

```bash
# 判断分支类型（默认 feat，可根据关键词调整）
# 关键词匹配:
#   "紧急修复"、"hotfix" → hotfix/<slug>, base=main/master
#   "修复"、"bug"、"fix"、"错误" → fix/<slug>, base=develop
#   "重构"、"refactor"、"优化"、"清理" → refactor/<slug>, base=develop
#   默认 → feat/<slug>, base=develop

BRANCH_TYPE="feat"
BASE_BRANCH="develop"
SLUG="<生成的 slug>"

# stash 未提交变更
STASH_NEEDED=false
if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
  STASH_NEEDED=true
  git stash push -m "dev-feat-auto-stash" --include-untracked
fi

# 切换到 base 分支并拉取最新
git checkout "$BASE_BRANCH"
git pull origin "$BASE_BRANCH" 2>/dev/null || true

# 创建功能分支
git checkout -b "$BRANCH_TYPE/$SLUG"

# 恢复 stash
if [ "$STASH_NEEDED" = true ]; then
  git stash pop 2>/dev/null || true
fi
```

记录变量：`branch_type`、`base_branch`、`slug`、`branch_name`（= `$BRANCH_TYPE/$SLUG`）。

#### use_git = false

不执行任何 git 命令。`slug` 从功能描述生成，`branch_name` = `feat-<slug>`（仅用作目录名）。

### Step 3: 初始化状态

创建状态目录和配置文件：

```bash
mkdir -p .dev/plan/<branch-name>
```

**写入 `.dev/config.yml`：** 仅写入已知信息，其余保留 null。

```yaml
git:
  base_branch: <base_branch 或 null>
  current_branch: <branch_name 或 null>
  slug: <slug>
  branch_type: <branch_type 或 null>

workflow:
  mode: feat
  complexity: null
  use_git: <use_git 值>

sub_branches:
  enabled: false
  slug: null
  active: null
  completed: []
  pending: []
  failed: []

# project / source_layout / architecture / build / test / verification / conventions 全部 null
```

**创建空文件 `.dev/plan/<branch-name>/TASK-LOG.md`：**

```markdown
# 任务执行记录

| 任务ID | 标题 | 状态 | 提交 | 开始时间 | 完成时间 |
|--------|------|------|------|---------|---------|
```

---

### Step 4: 产品讨论 — 内联 spawn dev-product

**这是唯一的人类交互点。** 以后所有工作完全由 AI 完成。

以内联方式 spawn Product Agent（因为 Product 需要 `AskUserQuestion`，必须在主会话中运行）：

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

**错误处理：** 如果 Product Agent 返回失败，向用户报告错误并终止流程。

---

### Step 5: 复杂度评估

**读取 PRD.md 关键信息，评估变更规模。** 不需要读取源代码，只看 PRD 中的用户故事、涉及模块、文件变更范围。

**评估规则：**

| 信号 | 简单 | 复杂 |
|------|------|------|
| 用户故事数 | 1-3 | 4+ |
| 预估变更文件 | 1-3 | 4+ |
| 新模块/目录 | 否 | 是 |

**评估逻辑：**
1. 读取 PRD.md 中的用户故事列表，计数
2. 从 PRD 的"与现有功能的集成"段和交互设计推断文件范围
3. 检查是否涉及创建新目录/模块
4. 如果任一信号指向"复杂"，整体判定为 complex

**将结果写入 `.dev/config.yml`：**

```yaml
workflow:
  mode: feat
  complexity: simple|complex
  use_git: <值>
```

**如果 `use_git=true` 且 `complexity=complex`，同时启用子分支：**

```yaml
sub_branches:
  enabled: true
  slug: <slug>
  active: null
  completed: []
  pending: []
  failed: []
```

**向用户显示评估结果：**

```
==================================================
 复杂度: <简单/复杂>
 评估依据: 用户故事 N 个, 预估变更 M 个文件, 新模块: <是/否>
==================================================
```

---

### Step 6: 并行 — 测试设计 + 架构设计

**并行 spawn tester 和 architect，同时运行：**

```
Agent(
  subagent_type="dev-tester",
  model="sonnet",
  prompt="
    <mode>design_only</mode>
    <project_root><项目根目录绝对路径></project_root>
    <config_path>.dev/config.yml</config_path>
    <test_design_path>.dev/plan/<branch-name>/TEST-DESIGN.md</test_design_path>
    <prd_path>.dev/plan/<branch-name>/PRD.md</prd_path>
    <branch_type><branch_type></branch_type>
    你是测试工程师。基于 PRD.md 生成测试用例设计文档。
    输出 TEST-DESIGN.md 到指定路径。
  "
)

Agent(
  subagent_type="dev-architect",
  model="opus",
  prompt="
    <project_root><项目根目录绝对路径></project_root>
    <config_path>.dev/config.yml</config_path>
    <architecture_path>.dev/plan/<branch-name>/ARCHITECTURE.md</architecture_path>
    <prd_path>.dev/plan/<branch-name>/PRD.md</prd_path>
    你是架构师。基于 PRD.md 设计系统架构，输出 ARCHITECTURE.md。
    当前复杂度: <simple/complex>。
    <如果 complex>请生成完整版架构设计，包含模块划分、接口定义、数据流、集成点。</如果>
    <如果 simple>请生成简化版架构设计，聚焦模块划分和关键接口。</如果>
  "
)
```

**等待两个 Agent 返回。**

**错误处理：**
- 如果任一 Agent 返回失败，重试一次（相同参数）
- 如果重试仍失败，向用户报告错误并终止流程

**确认产物：**
1. 确认 TEST-DESIGN.md 和 ARCHITECTURE.md 文件已生成
2. 只保留关键信息（1-2 行摘要）

---

### Step 7: 规划

**spawn planner：**

```
Agent(
  subagent_type="dev-planner",
  model="opus",
  prompt="
    <feature_description><功能描述></feature_description>
    <project_root><项目根目录绝对路径></project_root>
    <config_path>.dev/config.yml</config_path>
    <plan_path>.dev/plan/<branch-name>/PLAN.md</plan_path>
    <prd_path>.dev/plan/<branch-name>/PRD.md</prd_path>
    <architecture_path>.dev/plan/<branch-name>/ARCHITECTURE.md</architecture_path>
    <branch_type><branch_type></branch_type>
    <branch_name><branch-name></branch_name>
    你是规划师。基于 PRD.md + ARCHITECTURE.md 进行任务分解，输出 PLAN.md。
    每个任务必须包含：描述、文件列表、依赖、可执行的验证方式。
  "
)
```

**等待 planner 返回。** 确认 PLAN.md 已生成且包含任务列表。

**更新 sub_branches.pending：** 从 PLAN.md 的任务列表中提取所有任务 ID，写入 config。

---

### Step 8a: 架构自审 [仅 complex]

**simple 路径跳过此步骤。**

**再次 spawn architect，包含自审要求：**

```
Agent(
  subagent_type="dev-architect",
  model="opus",
  prompt="
    <project_root><项目根目录绝对路径></project_root>
    <config_path>.dev/config.yml</config_path>
    <architecture_path>.dev/plan/<branch-name>/ARCHITECTURE.md</architecture_path>
    <prd_path>.dev/plan/<branch-name>/PRD.md</prd_path>
    <test_design_path>.dev/plan/<branch-name>/TEST-DESIGN.md</test_design_path>
    你是架构师。请审查你之前生成的 ARCHITECTURE.md，检查：
    - PRD 中的功能是否都有模块支撑
    - 测试用例是否都能在架构下执行
    - 模块边界是否清晰、无循环依赖

    如果发现问题，直接修正 ARCHITECTURE.md。完成后返回摘要。
  "
)
```

**等待 architect 返回。** 确认 ARCHITECTURE.md 已更新（如有修正）。

---

### Step 8b: 技术设计 [仅 complex]

**simple 路径跳过此步骤。**

**spawn tech-designer：**

```
Agent(
  subagent_type="dev-tech-designer",
  model="sonnet",
  prompt="
    <project_root><项目根目录绝对路径></project_root>
    <config_path>.dev/config.yml</config_path>
    <tech_design_path>.dev/plan/<branch-name>/TECH-DESIGN.md</tech_design_path>
    <plan_path>.dev/plan/<branch-name>/PLAN.md</plan_path>
    <architecture_path>.dev/plan/<branch-name>/ARCHITECTURE.md</architecture_path>
    你是技术设计师。基于 PLAN.md 和 ARCHITECTURE.md，为每个任务设计详细技术方案。
    输出 TECH-DESIGN.md 到指定路径。
  "
)
```

**等待 tech-designer 返回。** 确认 TECH-DESIGN.md 已生成。

---

### Step 9: 开发循环

**根据 complexity 和 use_git 决定开发策略。**

#### 分析并行任务

从 PLAN.md 读取任务列表，获取所有依赖已完成的开发任务（初始轮次为依赖为"无"的任务）。

**分析规则：**
1. 从 PLAN.md 获取所有可执行的开发任务（依赖已完成或无依赖）
2. 这些任务之间没有相互依赖，可以并行执行
3. 检查文件列表是否有冲突（同一文件被多个任务修改）

**spawn 规则：**

| 可并行任务数 | developer 实例数 | 策略 |
|-------------|-----------------|------|
| 1 | 1 | 单个 developer |
| 2-3 | 2 | 并行 spawn 2 个 |
| 4+ | 3 | 并行 spawn 3 个（上限 3） |

**文件冲突处理：** 如果并行任务修改相同文件，将冲突任务串行执行（先执行不冲突的并行组，再执行冲突任务）。

#### 创建子分支 [仅 use_git=true 且 complexity=complex]

对于每个任务（或并行任务组中的每个任务）：

```bash
# 从集成分支创建子分支
git checkout <integration-branch>
# 编号从已有子分支中自动递增
git checkout -b <type>/<slug>-t<NN>
```

更新 config：`sub_branches.active = "<type>/<slug>-t<NN>"`

#### spawn developer(s)

为每个任务 spawn developer：

```
Agent(
  subagent_type="dev-developer",
  model="sonnet",
  prompt="
    <task_id><T-XX></task_id>
    <task_title><任务标题></task_title>
    <task_description><任务完整描述></task_description>
    <task_files><文件列表></task_files>
    <task_verification><验证方式></task_verification>
    <project_root><项目根目录绝对路径></project_root>
    <config_path>.dev/config.yml</config_path>
    <plan_path>.dev/plan/<branch-name>/PLAN.md</plan_path>
    <prd_path>.dev/plan/<branch-name>/PRD.md</prd_path>
    <test_design_path>.dev/plan/<branch-name>/TEST-DESIGN.md</test_design_path>
    <branch_type><branch_type></branch_type>
    <如果 TECH-DESIGN.md 存在><tech_design_path>.dev/plan/<branch-name>/TECH-DESIGN.md</tech_design_path></如果>
    你是开发者。实现指定任务，完成后提交代码。
  "
)
```

#### 等待 developer 返回

**处理结果：**

| 返回状态 | 动作 |
|---------|------|
| `TASK COMPLETE` | 进入 Step 10 (recorder) |
| `TASK BLOCKED` | 记录到 TASK-LOG.md，跳过该任务，继续下一个 |

---

### Step 10: Recorder — 每任务完成后触发

**每个任务完成后，内联 spawn recorder（不阻塞，后台运行）：**

```
Agent(
  subagent_type="dev-recorder",
  model="sonnet",
  run_in_background=true,
  prompt="
    <phase>development</phase>
    <task_id><T-XX></task_id>
    <task_title><任务标题></task_title>
    <branch_name><branch-name></branch_name>
    <changed_files><本任务修改的文件列表></changed_files>
    <commit_hash><提交短哈希></commit_hash>
    <project_root><项目根目录绝对路径></project_root>
    <knowledge_dir>docs/knowledge/</knowledge_dir>
    <config_path>.dev/config.yml</config_path>
    <notes><开发过程中遇到的问题、踩的坑，如果没有就写 无></notes>
  "
)
```

**不等 recorder 完成，立即继续处理。**

#### 合并子分支 [仅 use_git=true 且 complexity=complex]

验证通过后合并子分支：

```bash
# 切回集成分支
git checkout <integration-branch>

# 合并子分支
git merge <type>/<slug>-t<NN> --no-ff -m "Merge <type>/<slug>-t<NN>: <任务标题>"

# 删除子分支
git branch -d <type>/<slug>-t<NN>
```

更新 config：
- `sub_branches.active = null`
- 追加到 `sub_branches.completed`

**合并冲突处理：**
```bash
git merge --abort
git checkout <type>/<slug>-t<NN>
git rebase <integration-branch>
# 解决冲突后
git checkout <integration-branch>
git merge <type>/<slug>-t<NN> --no-ff
```

**更新 TASK-LOG.md：** 记录任务完成状态、提交哈希、完成时间。

---

### Step 9-10 循环决策

检查 PLAN.md 中的任务列表：

| 判断条件 | 动作 |
|---------|------|
| 还有未执行的开发任务 | → 回到 Step 9 |
| 所有任务已完成 | → 进入 Step 11 |
| 遇到无法自主解决的问题 | → 询问用户 |

**上下文保护：** 如果上下文使用超过 60%，输出进度摘要并建议 `/dev:resume`。

---

### Step 11: 验证

**直接执行验证命令。** 读取 `.dev/config.yml` 的 `verification.commands`。如果为空，从 PLAN.md 验证字段获取。

**按顺序执行验证：**

```bash
# 1. 类型检查（如果有）
# 2. lint（如果有）
# 3. 构建（如果有）
# 4. 单元测试（如果有）
```

**验证通过：** 进入 Step 12

**验证失败：**

1. 将验证失败输出作为上下文，再次 spawn developer 要求修复
2. 最多重试 2 轮
3. 仍失败 → 记录 FAILED 到 TASK-LOG.md，进入 Step 12（标注部分失败）

---

### Step 12: 验收

**生成验收说明书：** 从 TASK-LOG.md 和 `git log --oneline <base_branch>..HEAD`（如果 use_git=true）提取信息，生成 `.dev/plan/<branch-name>/ACCEPTANCE.md`。

**ACCEPTANCE.md 内容：**

```markdown
# 验收说明书: <功能名称>

## 概要

| 字段 | 值 |
|------|-----|
| 功能名称 | <名称> |
| 复杂度 | simple/complex |
| 分支 | <branch-name> |
| 总任务数 | N |
| 完成任务数 | M |
| 失败任务数 | K |
| 验证结果 | 通过/部分通过 |

## 任务执行记录

| 任务ID | 标题 | 状态 | 提交 |
|--------|------|------|------|
| T-01 | <标题> | 完成 | <hash> |
| T-02 | <标题> | 完成 | <hash> |

## 变更文件清单

<文件列表>

## 验证结果

<验证命令及输出摘要>

## 已知问题

<如有失败任务或验证问题，列出>
```

**如果 use_git=true，提交验收说明书：**

```bash
git add .dev/plan/<branch-name>/ACCEPTANCE.md
git commit -m "docs: 添加验收说明书"
```

---

### Step 13: 摘要

**显示最终摘要：**

```
================================================================
 DEV:FEAT WORKFLOW COMPLETE
================================================================
 功能: <功能描述>
 复杂度: <简单/复杂>
 分支: <branch-name> (或 "无 git 模式")
 任务: 完成 X/Y
 失败: Z
 验证: <通过/部分通过>
 产物: .dev/plan/<branch-name>/

 下一步:
   验收测试  -- 按 ACCEPTANCE.md 确认功能
   /dev:status   -- 查看工作流状态
   /git:finish   -- 合并到 <base_branch> (需 use_git=true)
================================================================
```

## 错误处理

| 错误场景 | 处理方式 |
|---------|---------|
| 分支已存在 | 提示用户，询问是否切换到已有分支或使用新名称 |
| Agent spawn 失败 | 重试一次，仍失败则终止并报告用户 |
| 开发任务阻塞 | 记录到 TASK-LOG.md，继续其他任务，最终汇总报告 |
| 验证失败（可修复） | spawn developer 修复，最多 2 轮 |
| 验证失败（不可修复） | 记录 FAILED，继续后续任务 |
| 合并冲突 | rebase 子分支解决冲突后重试合并 |
| 上下文超限 | 输出进度摘要，建议 `/dev:resume` 恢复 |

## Git 操作条件化

所有 git 操作受 `use_git` 控制：

| 操作 | use_git=true | use_git=false |
|------|-------------|---------------|
| 创建分支 | 执行 | 跳过 |
| 子分支创建/合并 | 执行 | 跳过 |
| git commit | 执行 | 跳过 |
| git stash | 执行 | 跳过 |
| git log 提取信息 | 执行 | 跳过 |
| slug 来源 | 分支名 | 功能描述生成 |
| 产物目录 | `.dev/plan/<branch-name>/` | `.dev/plan/feat-<slug>/` |
| ACCEPTANCE.md 提交 | 执行 | 不提交（仅生成文件） |

## 与其他命令的关系

| 命令 | 定位 |
|------|------|
| `/dev:feat` | 本命令。功能开发的主力模式 |
| `/dev:patch` | 超轻量补丁。1-2 文件改动，无 git 无文档 |
| `/dev:start` | 旧版统一入口。保留兼容，内部可路由到 feat |
| `/dev:resume` | 恢复中断的 feat 工作流 |
| `/dev:status` | 查看当前 feat 工作流状态 |
| `/git:finish` | feat 完成后合并分支到 base |

## 使用示例

```bash
# 基本用法（默认启用 git）
/dev:feat 添加用户登录功能

# 禁用 git（不创建分支、不提交）
/dev:feat --no-git 添加暗色主题切换

# 显式启用 git（同默认行为）
/dev:feat --git 实现文件上传和预览
```

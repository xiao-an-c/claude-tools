---
name: refactor
display_name: "代码重构"
description: "架构师驱动的代码重构：识别坏味道，制定重构计划，逐步原子化实施。每步保持测试通过。"
category: code-change
argument_hint: "[--git|--no-git] <重构描述>"
defaults:
  use_git: true
  base_branch: develop
  branch_type: refactor
  config_depth: full
---

# Workflow: 代码重构

## 适用场景

- 代码结构改善（提炼函数、提炼类、搬移函数等）
- 消除重复代码
- 简化条件逻辑
- 改善命名、接口设计
- 模块拆分或合并
- 类型统一、模式替换
- 任何"不改变外部行为，只改善内部结构"的改动

## 不适用

- 新功能开发（用 feat）
- Bug 修复（用 fix）
- 小改动（用 patch）
- 需要新测试设计的改动（重构应保持现有测试通过）

## 预期耗时

10-30 分钟（取决于重构步骤数）

## 状态管理

创建 `.dev/plan/refactor-<slug>/` 目录，生成 config.yml、ARCHITECTURE.md、PLAN.md、TASK-LOG.md、ACCEPTANCE.md。

## Agent 列表

| 角色 | Agent Name | 模型 | Spawn 方式 |
|------|-----------|------|-----------|
| 架构分析 | `dev-architect` | opus | 内联 spawn |
| 任务规划 | `dev-planner` | opus | 按序 spawn |
| 开发执行 | `dev-developer` | sonnet | 逐任务 spawn（顺序，不并行） |
| 经验记录 | `dev-recorder` | sonnet | 后台 spawn（不阻塞） |

无 Product Agent、无 Tester Agent。

## 步骤

### Step 1: 解析输入

Type: builtin
Action: parse_arguments

解析 `$ARGUMENTS` 获取重构描述和可选的 git 标志。

**标志解析：**
- 提取 `--git` 标志 -> `use_git = true`（默认）
- 提取 `--no-git` 标志 -> `use_git = false`
- 两者都未指定 -> `use_git = true`（默认启用 git）
- 从剩余文本中提取重构描述

**如果没有重构描述：**

```
AskUserQuestion(questions=[{
  header: "重构描述",
  multi_select: false,
  options: [],
  question: "请描述要重构的代码范围和目标，例如：'重构 src/utils 工具函数，消除重复代码并改善命名'"
}])
```

等待用户输入后继续。

**从重构描述生成 slug：** 提取关键词，用短横线连接。例如 "重构工具函数消除重复" -> "utils-dedup"。

### Step 2: 创建分支

Type: builtin
Action: create_branch
Condition: use_git=true

分支类型固定为 `refactor/<slug>`，base_branch 为 `develop`。

**检测当前分支并创建：**

```bash
STASH_NEEDED=false
if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
  STASH_NEEDED=true
  git stash push -m "refactor-workflow-auto-stash" --include-untracked
fi

git checkout develop
git pull origin develop 2>/dev/null || true
git checkout -b refactor/<slug>

if [ "$STASH_NEEDED" = true ]; then
  git stash pop 2>/dev/null || true
fi
```

**如果 use_git=false：** 跳过分支创建，直接在当前分支工作。

### Step 3: 初始化状态目录和项目配置

Type: builtin
Action: init_state

```bash
mkdir -p .dev/plan/refactor-<slug>
```

**创建 `.dev/config.yml`：**

```yaml
# Auto-discovered by agents. NEVER hand-edited.

git:
  base_branch: develop
  current_branch: refactor/<slug>
  slug: <slug>
  branch_type: refactor

workflow:
  mode: refactor

refactor:
  use_git: <use_git>
  description: <重构描述>

sub_branches:
  enabled: <use_git>
  slug: <slug>
  active: null
  completed: []
  pending: []
  failed: []

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

**创建 `.dev/plan/refactor-<slug>/TASK-LOG.md`：**

```markdown
# 任务执行记录: refactor/<slug>

## 信息

| 字段 | 值 |
|------|-----|
| 重构描述 | <重构描述> |
| 分支 | refactor/<slug> |
| 创建时间 | YYYY-MM-DD HH:mm |

## 执行日志

（由编排器在 Step 6-8 循环中逐步填充）
```

### Step 4: 架构分析

Type: agent
Agent: dev-architect
Model: opus
Spawn: inline

以内联方式 spawn 架构师，分析代码并识别坏味道，输出重构计划。

```
<refactor_request>${description}</refactor_request>
<project_root>${project_root}</project_root>
<config_path>.dev/config.yml</config_path>
<architecture_path>.dev/plan/refactor-${slug}/ARCHITECTURE.md</architecture_path>

你是架构师。这是一个纯重构任务，不需要 PRD 和 TEST-DESIGN。

你的任务：
1. 读取 <refactor_request> 中指定的代码文件和目录
2. 识别代码坏味道（重复代码、过长函数、过大类、过长参数列、发散式变化、霰弹式修改、依恋情结、数据泥团、基本类型偏执、switch 惊悚等）
3. 对每个坏味道，从《重构》中选择合适的重构手法
4. 制定分步重构计划，确保每步是原子的、可验证的
5. 将分析结果写入 <architecture_path>

输出格式要求：

```markdown
# 重构架构分析: <重构描述>

## 概要

| 字段 | 值 |
|------|-----|
| 重构范围 | [涉及的模块/目录] |
| 坏味道数 | N |
| 重构手法数 | M |
| 预估步骤 | K |
| 风险等级 | 低/中/高 |

## 代码坏味道

| 坏味道 | 位置 | 严重度 | 重构手法 |
|--------|------|--------|---------|
| [坏味道类型] | [文件/函数] | 高/中/低 | [选用的重构手法] |

## 重构计划

### Step 1: [重构步骤名称]
- **手法:** [Martin Fowler 重构手法名称]
- **范围:** [涉及的文件和函数]
- **说明:** [具体操作描述]
- **验证:** [如何确认此步未破坏行为]

### Step 2: [重构步骤名称]
...

## 风险与注意事项

| 风险 | 影响 | 缓解策略 |
|------|------|---------|
| [风险] | [影响] | [策略] |

## 重构前后对比预期

### 结构变化
[描述重构前后的代码结构变化]

### 预期改善
[列出可衡量的改善指标]
```

重要原则：
- 每个重构步骤必须足够小，独立执行后测试应仍然通过
- 遵循 Martin Fowler 的小步前进原则
- 先消除最严重的坏味道，再处理次要的
- 记录每步使用的具体重构手法名称
```

**Agent 返回后：**
1. 确认 ARCHITECTURE.md 已生成
2. 只保留关键信息：坏味道数、重构步骤数、风险等级

### Step 5: 任务规划

Type: agent
Agent: dev-planner
Model: opus
Spawn: inline

将架构师的重构步骤拆分为可执行的开发任务。

```
<project_root>${project_root}</project_root>
<config_path>.dev/config.yml</config_path>
<plan_path>.dev/plan/refactor-${slug}/PLAN.md</plan_path>
<architecture_path>.dev/plan/refactor-${slug}/ARCHITECTURE.md</architecture_path>
<branch_type>refactor</branch_type>
<branch_name>refactor/${slug}</branch_name>

你是规划师。这是一个纯重构任务，不需要 PRD 和 TEST-DESIGN。

请基于 ARCHITECTURE.md 中的重构计划，将每个重构步骤拆分为原子任务。

重构任务的特别要求：
- 每个任务对应一个原子重构操作（一个 commit）
- 任务粒度：每个任务应是单一重构手法（如"提炼函数"、"搬移方法"）
- 每个任务的验证必须包括：运行已有测试确认行为未改变
- 任务之间保持严格的顺序依赖，确保中间状态都是稳定的
- 不要设计新测试，只依赖现有测试验证行为保持
- commit type 统一使用 refactor

输出 PLAN.md 到 <plan_path>。
```

**等待 planner 返回。** 确认 PLAN.md 已生成，记录任务数量。

**将 PLAN.md 中的任务 ID 列表写入 `.dev/config.yml` 的 `sub_branches.pending`。**

### Step 6-8: 开发循环（逐任务顺序执行）

对 PLAN.md 中的每个任务，按依赖顺序逐个执行以下子步骤。每次只 spawn 一个 developer，不并行。

#### Step 6: 开发执行

Type: agent
Agent: dev-developer
Model: sonnet
Spawn: inline
Sequential: true (one at a time)

**对于每个任务（按依赖顺序）：**

##### 6a. 创建子分支（if use_git=true）

```bash
git checkout refactor/${slug}
git checkout -b refactor/${slug}-t<NN>
```

编号从 01 开始，从已有子分支自动递增。

**更新 `.dev/config.yml`：** `sub_branches.active = "refactor/${slug}-t<NN>"`

**如果 use_git=false：** 跳过子分支创建，直接在 refactor/${slug} 分支上工作。

##### 6b. spawn developer

```
<project_root>${project_root}</project_root>
<config_path>.dev/config.yml</config_path>
<plan_path>.dev/plan/refactor-${slug}/PLAN.md</plan_path>
<task_id>${task_id}</task_id>
<task_title>${task_title}</task_title>
<task_description>${task_description}</task_description>
<task_files>${task_files}</task_files>
<task_verification>${task_verification}</task_verification>
<branch_type>refactor</branch_type>

你是开发者。这是一个重构任务。

重构任务的特别要求：
- 只做结构改善，不改变外部行为
- 严格遵循重构手法描述，不做额外的"顺便"改动
- 保持现有的代码风格和模式
- 不要引入新依赖
- 不要修改测试文件（除非重构步骤明确要求调整测试以适应新结构）
- commit type 使用 refactor

实现完成后提交代码。
```

**等待 developer 返回摘要。**

- 成功 -> 进入 Step 7（记录 + 验证）
- 阻塞 -> 记录到 TASK-LOG.md，询问用户处理方式

#### Step 7: 经验记录

Type: agent
Agent: dev-recorder
Model: sonnet
Spawn: background

在 developer 完成后，后台启动 recorder 记录重构经验。不等 recorder 完成，立即进入 Step 8。

```
<phase>development</phase>
<task_id>${task_id}</task_id>
<task_title>${task_title}</task_title>
<branch_name>refactor/${slug}</branch_name>
<changed_files>${changed_files}</changed_files>
<commit_hash>${commit_hash}</commit_hash>
<project_root>${project_root}</project_root>
<knowledge_dir>docs/knowledge/</knowledge_dir>
<notes>${recorder_notes}</notes>
```

#### Step 8: 验证 + 合并子分支

Type: builtin
Action: verify_and_merge
Per-task: true
Rollback_on_failure: true

##### 8a. 验证

**读取 `.dev/config.yml` 的 `verification.commands`。** 依次执行验证命令。

**验证必须全部通过。** 重构的核心约束是：行为不变，测试始终通过。

**如果验证通过：**
- 进入 8b 合并子分支

**如果验证失败：**

1. 将验证失败输出作为上下文，再次 spawn developer 要求修复
2. developer 的 prompt 中附加：
   ```
   上次验证失败，输出如下：
   <验证失败输出>

   请修复问题，确保重构不破坏现有行为。如果无法安全修复，回退此步的重构变更。
   ```
3. 最多重试 2 轮
4. 仍失败 -> 记录 FAILED 到 TASK-LOG.md，回退此步变更，进入 8c 清理子分支

**验证回退命令：**
```bash
git reset --hard HEAD~1
```

##### 8b. 合并子分支（if use_git=true）

```bash
git checkout refactor/${slug}
git merge refactor/${slug}-t<NN> --no-ff -m "Merge refactor/${slug}-t<NN>: ${task_title}"
git branch -d refactor/${slug}-t<NN>
```

**更新 `.dev/config.yml`：**
- `sub_branches.active = null`
- 追加到 `sub_branches.completed`

**合并冲突处理：**
```bash
git merge --abort
git checkout refactor/${slug}-t<NN>
git rebase refactor/${slug}
# 解决冲突后
git checkout refactor/${slug}
git merge refactor/${slug}-t<NN> --no-ff
```

**如果 use_git=false：** 跳过合并步骤。

##### 8c. 清理失败子分支（if use_git=true）

```bash
git checkout refactor/${slug}
git branch -D refactor/${slug}-t<NN>
```

**更新 `.dev/config.yml`：** 追加到 `sub_branches.failed`。

##### 8d. 更新 TASK-LOG.md

无论成功或失败，追加到此文件：

```markdown
### ${task_id}: ${task_title} -- ${status}

| 字段 | 值 |
|------|-----|
| 重构手法 | [Martin Fowler 手法名称] |
| 坏味道 | [消除的坏味道类型] |
| 文件 | [修改的文件列表] |
| 提交 | <短哈希> |
| 验证 | <通过/失败> |
| 耗时 | <估计> |
```

### Step 9: 任务循环决策

Type: builtin
Action: loop_decision

检查 PLAN.md 中的任务列表：

| 判断条件 | 动作 |
|---------|------|
| 还有未执行的重构任务 | -> 回到 Step 6 |
| 所有任务已完成 | -> 进入 Step 10 |
| 连续 2 个任务失败 | -> 暂停，询问用户是否继续 |
| 遇到无法自主解决的问题 | -> 询问用户 |

**上下文保护：** 如果上下文使用超过 60%，输出进度摘要并建议 `/dev:resume`。

### Step 10: 生成验收说明书

Type: builtin
Action: generate_acceptance

从 TASK-LOG.md 和 `git log --oneline develop..HEAD` 提取信息，生成验收说明书。

**生成 `.dev/plan/refactor-${slug}/ACCEPTANCE.md`：**

```markdown
# 重构验收说明书: ${description}

## 概要

| 字段 | 值 |
|------|-----|
| 重构范围 | [模块/目录] |
| 分支 | refactor/${slug} |
| 识别坏味道 | N 个 |
| 完成步骤 | X/Y |
| 风险等级 | 低/中/高 |
| 所有测试 | 通过/失败 |

## 代码坏味道消除清单

| 坏味道 | 位置 | 重构手法 | 状态 |
|--------|------|---------|------|
| [坏味道] | [位置] | [手法] | 已消除/未处理 |

## 重构前后对比

### 结构变化
[对比重构前后的代码结构变化]

### 度量对比
| 指标 | 重构前 | 重构后 | 变化 |
|------|--------|--------|------|
| 重复代码块 | N | M | -X |
| 最大函数长度 | N 行 | M 行 | -X |
| 最大类方法数 | N | M | -X |
| 循环依赖 | N | M | -X |

## 提交记录

<git log --oneline develop..HEAD 输出>

## 验证结果

| 验证项 | 结果 |
|--------|------|
| 构建 | 通过/失败 |
| 类型检查 | 通过/失败 |
| Lint | 通过/失败 |
| 单元测试 | 通过/失败 |

## 遗留事项

- [未完成的重构步骤]
- [重构过程中发现但未处理的问题]
- [后续建议]
```

**Quick 验收（失败任务数 > 0 或步骤未全部完成）：** 在验收说明书中标注未完成项，不阻塞后续操作。

### Step 11: 显示结果摘要

Type: builtin
Action: display_summary

```
================================================================
 REFACTOR COMPLETE
================================================================
 重构: ${description}
 分支: refactor/${slug}
 坏味道: 识别 N 个, 消除 M 个
 步骤: 完成 X/Y
 测试: 全部通过 (行为保持)
 提交: N 个
 验收说明书: .dev/plan/refactor-${slug}/ACCEPTANCE.md

 下一步:
   /dev:status   -- 查看工作流状态
   /git:finish   -- 合并到 develop
================================================================
```

**如果 use_git=false：** 省略分支和 git 相关的行。

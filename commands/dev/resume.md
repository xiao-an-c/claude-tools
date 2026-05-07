---
name: dev:resume
description: 恢复中断的开发工作流，从上次进度继续执行
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

# /dev:resume — 恢复工作流

## 绝对禁止 — 你是调度器，不是执行者

你只做调度和文件状态管理。**禁止执行以下操作**：

- 读取 src/ 下的源代码文件
- 分析代码逻辑、bug 原因、技术方案
- 编写或修改任何源代码
- 运行测试、构建、安装依赖
- 做任何技术判断（方案选择、代码评估）

**唯一允许的操作：**

- 读取工作流状态文件（PLAN.md, TASK-LOG.md, TEST-DESIGN.md, ARCHITECTURE.md, TECH-DESIGN.md, ACCEPTANCE.md）
- 读取 `.dev/config.yml` 项目配置
- 执行 git 命令（查看状态）
- 使用 Agent() spawn 各阶段 Agent，通过文件状态判断恢复点
- 写入工作流状态文件（TASK-LOG.md, ACCEPTANCE.md）

**如果你发现自己正在阅读源代码或思考技术方案 → 立即停止 → 改用 Agent 工具委托。**

## 执行流程

### 1. 检查当前分支

```bash
CURRENT_BRANCH=$(git branch --show-current)
```

如果不是 `feat/*`、`fix/*`、`refactor/*`、`hotfix/*`、`release/*` 分支（包括子分支 `<type>/<slug>-t*`），提示 "当前分支没有可恢复的工作流。"

**子分支检测：** 如果当前分支匹配 `^(feat|fix|refactor|hotfix|release)/(.+)-t\d+$`，提取父分支名，恢复点判断需要考虑子分支状态。

### 2. 读取状态

读取 `.dev/plan/<current-branch>/` 下的状态文件。

如果当前在子分支上，读取 `.dev/plan/<parent-branch>/` 下的状态文件。

读取 `.dev/config.yml` 获取项目配置。**关键：读取 `workflow.tier` 和 `sub_branches` 配置。**

检查文件存在性：
- `PRD.md` — 产品需求文档
- `TEST-DESIGN.md` — 测试用例设计文档
- `ARCHITECTURE.md` — 架构设计文档
- `PLAN.md` — 任务规划
- `TECH-DESIGN.md` — 技术设计文档
- `TASK-LOG.md` — 执行记录
- `ACCEPTANCE.md` — 验收说明书

如果 PRD.md 不存在，提示 "未找到需求文档。使用 /dev:start 启动新工作流。"

**从 config 获取：**
- `workflow.tier` — 工作流级别 (quick/standard/full)
- `git.base_branch` — 基础分支（回退到 `develop`）
- `git.branch_type` — 分支类型
- `verification.commands` — 验证命令（回退到 PLAN.md 验证字段）
- `build.dev_command` — 开发命令（回退到省略）

### 3. 判断恢复点（按级别）

根据 `workflow.tier` 和缺失文件判断恢复点：

#### Quick 级别的恢复点

| 条件 | 恢复点 | 说明 |
|------|--------|------|
| PRD.md 不存在 | **Step 4** | 需重新执行产品讨论 |
| TASK-LOG.md 为空或不存在 | **Step 10** | 直接开始开发 |
| TASK-LOG.md 有待执行任务 | **Step 10** | 继续开发 |
| 所有任务已完成，ACCEPTANCE.md 不存在 | **Step 13** | 生成验收说明书 |
| ACCEPTANCE.md 已存在 | 已完成 | 提示工作流已完成 |

Quick 级别不需要创建团队，直接内联 spawn developer。

#### Standard 级别的恢复点

| 条件 | 恢复点 | 说明 |
|------|--------|------|
| PRD.md 不存在 | **Step 4** | 需重新执行产品讨论 |
| TEST-DESIGN.md 或 ARCHITECTURE.md 不存在 | **Step 6** | spawn architect + tester 并行执行 |
| PLAN.md 不存在 | **Step 8** | spawn planner 执行任务规划 |
| TASK-LOG.md 有待执行任务 | **Step 10** | spawn developer 继续开发循环 |
| 所有任务已完成，ACCEPTANCE.md 不存在 | **Step 13** | 直接生成验收说明书 |
| ACCEPTANCE.md 已存在 | 已完成 | 提示 /git:finish |

#### Full 级别的恢复点

| 条件 | 恢复点 | 说明 |
|------|--------|------|
| PRD.md 不存在 | **Step 4** | 需重新执行产品讨论 |
| TEST-DESIGN.md 不存在 | **Step 5** | spawn tester 执行测试设计 |
| ARCHITECTURE.md 不存在 | **Step 6** | spawn architect 执行架构设计 |
| PLAN.md 不存在 | **Step 8** | spawn planner 执行任务规划 |
| TECH-DESIGN.md 不存在 | **Step 9** | spawn tech-designer 执行技术设计 |
| TASK-LOG.md 有待执行任务 | **Step 10** | spawn developer 继续开发循环 |
| 所有任务已完成，ACCEPTANCE.md 不存在 | **Step 13** | 直接生成验收说明书 |
| ACCEPTANCE.md 已存在 | 已完成 | 提示工作流已完成 |
| 有 FAILED 任务 | Step 10 | 询问用户：重试失败任务 / 跳过 / 终止 |
| 有 BLOCKED 任务 | Step 10 | 询问用户如何处理阻塞 |

### 4. 恢复产品讨论（仅恢复点 = Step 4）

如果 PRD.md 不存在，以内联方式 spawn dev-product（与 /dev:start 的 Step 4 相同），然后继续。

### 5. 按恢复点 spawn Agent（按级别）

**不使用团队。编排器直接根据恢复点 spawn 对应的 Agent，通过文件状态判断恢复点。**

#### Quick 级别：直接内联 spawn developer

与 `/dev:start` 的 Quick 模式一致，直接内联 spawn developer：

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

#### Standard 级别：按需 spawn

根据恢复点，spawn 对应的 Agent：

| 恢复点 | spawn 策略 |
|--------|-----------|
| Step 6 | 并行 spawn architect + tester |
| Step 8 | spawn planner |
| Step 10 | spawn developer(s)（从 TASK-LOG.md 读取未完成的任务） |

spawn 参数与 `/dev:start` 中对应 Step 的 Agent spawn 格式一致。

#### Full 级别：按需 spawn

根据恢复点，spawn 对应的 Agent：

| 恢复点 | spawn 策略 |
|--------|-----------|
| Step 5 | spawn tester |
| Step 6 | spawn architect |
| Step 7 | spawn architect（自审） |
| Step 8 | spawn planner |
| Step 9 | spawn tech-designer |
| Step 10 | spawn developer(s)（从 TASK-LOG.md 读取未完成的任务） |

spawn 参数与 `/dev:start` 中对应 Step 的 Agent spawn 格式一致。

### 6. 从恢复点继续执行

**不再通过消息通知，直接 spawn Agent。** 按照 `/dev:start` 中对应 Step 的相同逻辑继续执行，遵守级别对应的步骤选择。

### 7. 显示恢复信息

```
================================================================
 DEV WORKFLOW RESUMED
================================================================
 分支: <branch> (<branch_type>)
 级别: <Quick/Standard/Full>
 恢复点: Step <N> - <描述>
 已完成: <已完成阶段列表>
 剩余任务: X 个
================================================================
```

### 8. 正常流程继续

从恢复点开始，后续流程与 `/dev:start` 完全一致。当所有工作完成后，执行 Step 13 的验收流程。

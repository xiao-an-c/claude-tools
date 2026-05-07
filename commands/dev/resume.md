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
  - TeamCreate
  - TeamDelete
  - TaskCreate
  - TaskList
  - TaskGet
  - TaskUpdate
  - SendMessage
---

# /dev:resume — 恢复工作流

## ⚠️ 绝对禁止 — 你是调度器，不是执行者

你只做调度和文件状态管理。**禁止执行以下操作**：

- ❌ 读取 src/ 下的源代码文件
- ❌ 分析代码逻辑、bug 原因、技术方案
- ❌ 编写或修改任何源代码
- ❌ 运行测试、构建、安装依赖
- ❌ 做任何技术判断（方案选择、代码评估）

**唯一允许的操作：**

- ✅ 读取工作流状态文件（PLAN.md, TASK-LOG.md, TEST-DESIGN.md, ARCHITECTURE.md, TECH-DESIGN.md, ACCEPTANCE.md）
- ✅ 读取 `.dev/config.yml` 项目配置
- ✅ 执行 git 命令（查看状态）
- ✅ 使用 Agent() + TeamCreate + SendMessage + Task* 工具管理团队
- ✅ 写入工作流状态文件（TASK-LOG.md, ACCEPTANCE.md）

**如果你发现自己正在阅读源代码或思考技术方案 → 立即停止 → 改用 Agent 工具委托。**

## 执行流程

### 1. 检查当前分支

```bash
CURRENT_BRANCH=$(git branch --show-current)
```

如果不是 `feat/*`、`fix/*`、`refactor/*` 分支，提示 "当前分支没有可恢复的工作流。"

### 2. 读取状态

读取 `.dev/plan/<current-branch>/` 下的状态文件。

读取 `.dev/config.yml` 获取项目配置（如果存在）。

检查文件存在性：
- `PRD.md` — 产品需求文档
- `TEST-DESIGN.md` — 测试用例设计文档
- `ARCHITECTURE.md` — 架构设计文档
- `PLAN.md` — 任务规划（必须存在）
- `TECH-DESIGN.md` — 技术设计文档
- `TASK-LOG.md` — 执行记录
- `ACCEPTANCE.md` — 验收说明书

如果 PLAN.md 不存在，提示 "未找到计划文件。使用 /dev:start 启动新工作流。"

**从 config 获取：**
- `git.base_branch` — 基础分支（回退到 `develop`）
- `verification.commands` — 验证命令（回退到 PLAN.md 验证字段）
- `build.dev_command` — 开发命令（回退到省略）

### 3. 判断恢复点

从状态文件中判断工作流中断在哪个阶段：

| 条件 | 恢复点 | 说明 |
|------|--------|------|
| PRD.md 不存在 | **Step 4** | 需重新执行产品讨论（内联 spawn dev-product） |
| TEST-DESIGN.md 不存在 | **Step 5** | 需创建团队并执行测试设计 |
| ARCHITECTURE.md 不存在 | **Step 6** | 需创建团队并执行架构设计 |
| PLAN.md 不存在 | **Step 8** | 需创建团队并执行任务规划 |
| TECH-DESIGN.md 不存在 | **Step 9** | 需创建团队并执行技术设计 |
| TASK-LOG.md 有待执行任务 | **Step 10** | 需创建团队并继续开发循环 |
| 所有任务已完成，ACCEPTANCE.md 不存在 | **Step 13** | 直接生成验收说明书 |
| ACCEPTANCE.md 已存在 | 已完成 | 提示工作流已完成，建议 /git:finish |
| 有 FAILED 任务 | Step 10 | 询问用户：重试失败任务 / 跳过 / 终止 |
| 有 BLOCKED 任务 | Step 10 | 询问用户如何处理阻塞 |

**注意：** 如果恢复点在 Step 5 及之后，需要创建团队（Step 4 的 Product 不需要团队）。

### 4. 恢复产品讨论（仅恢复点 = Step 4）

如果 PRD.md 不存在，以内联方式 spawn dev-product（与 /dev:start 的 Step 4 相同），然后继续 Step 5。

### 5. 创建团队 + 恢复任务状态

**创建团队：**

```
TeamCreate(
  team_name="dev-workflow",
  description="恢复开发工作流: <功能描述>"
)
```

**重建 TaskList：** 根据恢复点和已完成状态创建任务。

| 恢复点 | 需要创建的任务 |
|--------|---------------|
| Step 5 | 测试设计, 架构设计, 架构自审, 任务规划, 技术设计 |
| Step 6 | 架构设计, 架构自审, 任务规划, 技术设计 |
| Step 7 | 架构自审, 任务规划, 技术设计 |
| Step 8 | 任务规划, 技术设计 |
| Step 9 | 技术设计 |
| Step 10 | 开发任务（从 TASK-LOG.md 读取未完成的任务） |

对于已完成阶段的任务，直接创建为 completed 状态，不分配 owner。

对于当前和后续阶段的任务，创建为 pending 状态，设置正确的 blockedBy 依赖。

**开发任务恢复：** 如果恢复点是 Step 10，从 TASK-LOG.md 和 PLAN.md 中读取未完成的开发任务，为每个创建 TaskCreate。

**spawn 全体团队成员：** 在一条消息中并行 spawn 7 个 Agent（与 /dev:start 的 Step 5 相同），全部加入团队。

### 6. 从恢复点继续执行

根据恢复点，发送对应的 START/EXECUTE 消息给相关 agent：

| 恢复点 | 动作 |
|--------|------|
| Step 5 | 分配 tester + architect，并行执行测试设计 + 架构设计 |
| Step 6 | 分配 architect 执行架构设计 |
| Step 7 | 分配 architect 执行架构自审 |
| Step 8 | 分配 planner 执行任务规划 |
| Step 9 | 分配 tech-designer 执行技术设计 |
| Step 10 | 分配 developer 执行下一个开发任务，进入开发循环 |

**从恢复点开始，按照 `/dev:start` 中对应 Step 的相同逻辑继续执行。**

**验证命令：** 读取 `.dev/config.yml` 的 `verification.commands`。如果 config 为空，回退到从 PLAN.md 验证字段获取。

### 7. 显示恢复信息

```
================================================================
 DEV WORKFLOW RESUMED
================================================================
 分支: <branch>
 恢复点: Step <N> - <描述>
 已完成: <已完成阶段列表>
 剩余任务: X 个
================================================================
```

### 8. 正常流程继续

从恢复点开始，后续流程（验证、循环、验收、shutdown）与 `/dev:start` 完全一致。当所有工作完成后，执行 Step 13 的验收和团队关闭流程。

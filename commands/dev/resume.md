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

- 读取工作流状态文件（PLAN.md, TASK-LOG.md, TEST-DESIGN.md, ARCHITECTURE.md, TECH-DESIGN.md, ACCEPTANCE.md, PRD.md）
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

读取 `.dev/config.yml` 获取项目配置。**关键：读取 `workflow.mode` 和 `sub_branches` 配置。**

如果 `workflow.mode` 不存在，尝试读取 `workflow.tier`（向后兼容）：

| 旧 tier | 新 mode |
|---------|---------|
| quick | fix |
| standard | feat |
| full | feat |

检查文件存在性：
- `PRD.md` — 产品需求文档（fix/feat 模式）
- `TEST-DESIGN.md` — 测试用例设计文档（feat 模式）
- `ARCHITECTURE.md` — 架构设计文档（feat/refactor 模式）
- `PLAN.md` — 任务规划（feat/refactor 模式）
- `TECH-DESIGN.md` — 技术设计文档（feat 复杂模式）
- `TASK-LOG.md` — 执行记录
- `ACCEPTANCE.md` — 验收说明书

如果所有状态文件都不存在，提示 "未找到工作流状态。使用 /dev:start 启动新工作流。"

### 3. 判断恢复点（按模式）

根据 `workflow.mode` 和缺失文件判断恢复点：

#### fix 模式的恢复点

| 条件 | 恢复点 | 说明 |
|------|--------|------|
| PRD.md 不存在 | **Step 4** | 重新执行架构师诊断 |
| TASK-LOG.md 为空或不存在 | **Step 6** | 开始开发 |
| TASK-LOG.md 有待执行任务 | **Step 6** | 继续开发 |
| 任务已完成，ACCEPTANCE.md 不存在 | **Step 9** | 生成验收说明书 |
| ACCEPTANCE.md 已存在 | 已完成 | 提示 /git:finish |

不需要创建团队，直接内联 spawn。

#### feat 模式的恢复点

| 条件 | 恢复点 | 说明 |
|------|--------|------|
| PRD.md 不存在 | **Step 4** | 重新执行产品讨论 |
| TEST-DESIGN.md 或 ARCHITECTURE.md 不存在 | **Step 6** | spawn architect + tester 并行 |
| PLAN.md 不存在 | **Step 7** | spawn planner |
| TECH-DESIGN.md 不存在（复杂模式） | **Step 8** | spawn tech-designer |
| TASK-LOG.md 有待执行任务 | **Step 9** | spawn developer(s) |
| 所有任务已完成，ACCEPTANCE.md 不存在 | **Step 12** | 生成验收说明书 |
| ACCEPTANCE.md 已存在 | 已完成 | 提示 /git:finish |
| 有 FAILED 任务 | **Step 9** | 询问用户：重试/跳过/终止 |

#### refactor 模式的恢复点

| 条件 | 恢复点 | 说明 |
|------|--------|------|
| ARCHITECTURE.md 不存在 | **Step 4** | 重新执行架构分析 |
| PLAN.md 不存在 | **Step 6** | spawn planner |
| TASK-LOG.md 有待执行任务 | **Step 7** | spawn developer(s) |
| 所有任务已完成，ACCEPTANCE.md 不存在 | **Step 10** | 生成验收说明书 |
| ACCEPTANCE.md 已存在 | 已完成 | 提示 /git:finish |

#### hotfix 模式的恢复点

| 条件 | 恢复点 | 说明 |
|------|--------|------|
| TASK-LOG.md 为空或不存在 | **Step 5** | 开始开发 |
| 任务已完成，ACCEPTANCE.md 不存在 | **Step 8** | 生成验收说明书 |
| ACCEPTANCE.md 已存在 | 已完成 | 提示 /git:finish |

### 4. 按恢复点 spawn Agent

**不使用团队。编排器直接根据恢复点 spawn 对应的 Agent。**

spawn 参数与对应模式文件中对应 Step 的 Agent spawn 格式一致。具体格式请参考：
- fix 模式 → `commands/dev/fix.md`
- feat 模式 → `commands/dev/feat.md`
- refactor 模式 → `commands/dev/refactor.md`
- hotfix 模式 → `commands/dev/hotfix.md`

### 5. 显示恢复信息

```
================================================================
 DEV WORKFLOW RESUMED
================================================================
 分支: <branch> (<branch_type>)
 模式: <fix/feat/refactor/hotfix>
 恢复点: Step <N> - <描述>
 已完成: <已完成阶段列表>
 剩余任务: X 个
================================================================
```

### 6. 正常流程继续

从恢复点开始，后续流程与对应模式文件完全一致。当所有工作完成后，执行验收流程。

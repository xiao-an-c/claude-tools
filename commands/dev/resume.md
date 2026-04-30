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

## ⚠️ 绝对禁止 — 你是调度器，不是执行者

你只做调度和文件状态管理。**禁止执行以下操作**：

- ❌ 读取 src/ 下的源代码文件
- ❌ 分析代码逻辑、bug 原因、技术方案
- ❌ 编写或修改任何源代码
- ❌ 运行测试、构建、安装依赖
- ❌ 做任何技术判断（方案选择、代码评估）

**唯一允许的操作：**

- ✅ 读取工作流状态文件（PLAN.md, TASK-LOG.md, TEST-DESIGN.md, ACCEPTANCE.md）
- ✅ 执行 git 命令（查看状态）
- ✅ 使用 Agent() 工具 spawn 子 Agent 委托所有技术工作
- ✅ 使用 AskUserQuestion 询问用户
- ✅ 写入工作流状态文件

**如果你发现自己正在阅读源代码或思考技术方案 → 立即停止 → 改用 Agent 工具委托。**

## 执行流程

### 1. 检查当前分支

```bash
CURRENT_BRANCH=$(git branch --show-current)
```

如果不是 `feat/*`、`fix/*`、`refactor/*` 分支，提示 "当前分支没有可恢复的工作流。"

### 2. 读取状态

读取 `.dev/plan/<current-branch>/` 下的状态文件。

检查文件存在性：
- `PLAN.md` — 计划文件（必须存在）
- `TASK-LOG.md` — 执行记录
- `TEST-DESIGN.md` — 测试用例设计文档
- `ACCEPTANCE.md` — 验收说明书

如果 PLAN.md 不存在，提示 "未找到计划文件。使用 /dev:start 启动新工作流。"

### 3. 判断恢复点

从状态文件中判断工作流中断在哪个阶段：

| 条件 | 恢复点 | 动作 |
|------|--------|------|
| PRD.md 不存在 | **Step 4** | spawn dev-product 进行产品讨论 |
| PRD.md 存在，PLAN.md 不存在 | **Step 5** | spawn dev-planner 基于 PRD 规划 |
| PLAN.md 存在，TEST-DESIGN.md 不存在 | **Step 6** | spawn dev-tester（design_only）生成测试用例文档 |
| PLAN.md + TEST-DESIGN.md 存在，TASK-LOG.md 有待执行任务 | **Step 7** | spawn dev-developer 继续下一个未执行任务 |
| 所有任务已完成，ACCEPTANCE.md 不存在 | **Step 10** | 生成验收说明书 |
| ACCEPTANCE.md 已存在 | 已完成 | 提示工作流已完成，建议 /git:finish |
| 有 FAILED 任务 | Step 7 | 询问用户：重试失败任务 / 跳过 / 终止 |
| 有 BLOCKED 任务 | Step 7 | 询问用户如何处理阻塞 |

### 4. 继续执行

从恢复点开始，按照 `/dev:start` 中对应 Step 的相同逻辑继续执行：

**如果恢复到 Step 4（产品讨论）：**
- spawn dev-product 与用户讨论需求、绘制线框图
- 完成后进入 Step 5

**如果恢复到 Step 5（规划）：**
- spawn dev-planner 基于 PRD 生成 PLAN.md
- 完成后进入 Step 6

**如果恢复到 Step 6（测试设计）：**
- spawn dev-tester（design_only 模式）生成 TEST-DESIGN.md
- 完成后进入 Step 7

**如果恢复到 Step 7（开发循环）：**
- 逐任务 spawn dev-developer（**每轮 1 个**）
- 每个任务完成后执行验证命令（从 PLAN.md 获取）
- 验证失败 → spawn developer 修复 → 重试（最多 2 轮）
- 验证通过 → 更新 TASK-LOG.md → 判断下一个任务
- 全部完成 → 进入 Step 10

**如果恢复到 Step 10（验收）：**
- 生成 ACCEPTANCE.md
- spawn dev-recorder 记录验收经验

### 5. 显示恢复信息

```
================================================================
 DEV WORKFLOW RESUMED
================================================================
 分支: <branch>
 恢复点: Step <N> - <描述>
 剩余任务: X 个
================================================================
```

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

- ✅ 读取工作流状态文件（PLAN.md, TASK-LOG.md, TEST-REPORT.md）
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

读取 `.dev/plan/<current-branch>/PLAN.md` 和 `TASK-LOG.md`。

如果 PLAN.md 不存在，提示 "未找到计划文件。使用 /dev:start 启动新工作流。"

### 3. 判断恢复点

从 TASK-LOG.md 中读取执行记录，确定哪些任务已完成、哪些待执行：

- **所有任务已完成且无测试报告** → spawn dev-tester
- **有待执行任务** → spawn dev-developer 继续下一个未执行任务
- **所有任务完成且有测试报告** → 工作流已完成，提示用户使用 /git:finish
- **有阻塞任务** → 询问用户如何处理

### 4. 继续执行

从恢复点开始，按照 `/dev:start` 中 Step 5/6/7/8/9 的相同逻辑继续执行：

- 逐任务 spawn dev-developer（每轮 2 个）
- 完成后 spawn dev-tester
- 全部完成后生成 ACCEPTANCE.md
- 最后 spawn dev-recorder 记录经验

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

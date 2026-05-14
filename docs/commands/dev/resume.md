# /dev:resume

恢复中断的开发工作流，从上次进度继续执行。

## 用法

```bash
/dev:resume
```

## 执行流程

### 1. 检查当前分支

如果不是 `feat/*`、`fix/*`、`refactor/*`、`hotfix/*`、`release/*` 分支（包括子分支 `<type>/<slug>-t*`），提示"当前分支没有可恢复的工作流。"

### 2. 读取状态

读取 `.dev/plan/<branch-name>/` 下的状态文件和 `.dev/config.yml`。

**关键配置：** 读取 `workflow.mode` 获取工作流类型，读取 `sub_branches` 配置获取子分支状态。

检查文件存在性：
- `PRD.md` — 产品需求文档 / Bug 报告
- `TEST-DESIGN.md` — 测试用例设计文档
- `ARCHITECTURE.md` — 架构设计 / 重构分析
- `PLAN.md` — 任务规划
- `TECH-DESIGN.md` — 技术设计文档
- `TASK-LOG.md` — 执行记录
- `ACCEPTANCE.md` — 验收说明书

如果所有状态文件都不存在，提示"未找到工作流状态。使用 `/dev:run <workflow>` 启动新工作流。"

### 3. 判断恢复点

**优先使用通用恢复逻辑（基于工作流定义）：**

读取 `.dev/workflows/${workflow.mode}.md`（或包内置 `workflows/${workflow.mode}.md`），按步骤表中的产出文件判断断点：

1. 遍历工作流定义中的每个步骤
2. 检查步骤的产出文件是否存在
3. 第一个产出文件缺失的步骤即为恢复点
4. 从该步骤开始，按工作流定义继续执行

**如果工作流定义文件不存在（向后兼容），使用按模式的恢复表：**

#### fix 模式

| 条件 | 恢复点 |
|------|--------|
| PRD.md 不存在 | Step 4 |
| TASK-LOG.md 为空或不存在 | Step 6 |
| TASK-LOG.md 有待执行任务 | Step 6 |
| 任务已完成，ACCEPTANCE.md 不存在 | Step 9 |
| ACCEPTANCE.md 已存在 | 已完成 |

#### feat 模式

| 条件 | 恢复点 |
|------|--------|
| PRD.md 不存在 | Step 4 |
| TEST-DESIGN.md 或 ARCHITECTURE.md 不存在 | Step 6 |
| PLAN.md 不存在 | Step 7 |
| TECH-DESIGN.md 不存在（复杂模式） | Step 8 |
| TASK-LOG.md 有待执行任务 | Step 9 |
| 所有任务已完成，ACCEPTANCE.md 不存在 | Step 12 |
| ACCEPTANCE.md 已存在 | 已完成 |
| 有 FAILED 任务 | Step 9（询问用户：重试/跳过/终止） |

#### refactor 模式

| 条件 | 恢复点 |
|------|--------|
| ARCHITECTURE.md 不存在 | Step 4 |
| PLAN.md 不存在 | Step 6 |
| TASK-LOG.md 有待执行任务 | Step 7 |
| 所有任务已完成，ACCEPTANCE.md 不存在 | Step 10 |
| ACCEPTANCE.md 已存在 | 已完成 |

#### hotfix 模式

| 条件 | 恢复点 |
|------|--------|
| TASK-LOG.md 为空或不存在 | Step 5 |
| 任务已完成，ACCEPTANCE.md 不存在 | Step 8 |
| ACCEPTANCE.md 已存在 | 已完成 |

### 4. 按恢复点 spawn Agent

**不使用团队。编排器直接根据恢复点 spawn 对应的 Agent。**

spawn 参数与对应工作流定义中步骤的 Agent spawn 格式一致，参考 `workflows/<mode>.md`。

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

从恢复点开始，后续流程与对应工作流定义完全一致。

## 注意事项

- 必须在 `feat/*`、`fix/*`、`refactor/*`、`hotfix/*` 或 `release/*` 分支执行
- 子分支（如 `feat/user-auth-t01`）也支持恢复
- 需要有 `.dev/plan/<branch>/` 目录和对应的状态文件
- 如果没有活跃的工作流，使用 `/dev:run <workflow>` 启动新工作流

## 相关命令

- [/dev:run](./run) -- 启动工作流
- [/dev:status](./status) -- 查看工作流状态
- [/git:finish](../git/finish) -- 完成并合并分支

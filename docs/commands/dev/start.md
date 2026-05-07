# /dev:start

启动多 Agent 团队协作开发工作流，覆盖从需求讨论到验收的完整流程。

## 用法

```bash
/dev:start <功能描述>
```

## 参数

- `功能描述`: 要开发的功能描述，支持中文。如 "添加用户登录功能"

## 执行流程

### 初始化阶段（一次性）

| Step | 内容 | 产出 |
|------|------|------|
| 1 | 解析输入 | - |
| 2 | 自动创建 git 分支（feat/fix/refactor） | 新分支 |
| 3 | 初始化 `.dev/plan/<branch>/` 状态目录 + `.dev/config.yml` | TASK-LOG.md |
| 4 | **产品讨论** — 与用户交互，澄清需求（唯一人类介入点） | PRD.md |

### 团队创建 + 并行设计

| Step | 内容 | 产出 |
|------|------|------|
| 5 | **创建团队** — 创建所有任务 + 按需 spawn Agent | TaskList |
| 6 | **并行** — 测试设计 + 架构设计同时执行 | TEST-DESIGN.md + ARCHITECTURE.md |
| 7 | **架构自审** — architect 审查修正自己的输出 | ARCHITECTURE.md（修正后） |
| 8 | **任务规划** — 基于所有输入分解任务 + 发现 build/test 配置 | PLAN.md |
| 9 | **技术设计** — 为每个任务设计详细实现策略 | TECH-DESIGN.md |

### 开发循环（支持并行）

| Step | 内容 | 产出 |
|------|------|------|
| 10 | **开发** — 逐任务执行（支持多个 developer 并行） | 代码 + 提交 |
| 11 | **验证** — 执行验证命令，失败时 tester + developer 协作（最多 2 轮） | 测试结果 |
| 12 | **决策** — 全部完成则进入验收，否则回到 Step 10 | 进度更新 |

### 收尾阶段

| Step | 内容 | 产出 |
|------|------|------|
| 13 | **验收** — 生成验收说明书 + 清理上下文 | ACCEPTANCE.md |

## 按需 spawn 策略

Agent 不一次性创建，只在任务可用时 spawn 对应角色，避免空闲等待：

| 阶段 | spawn 的 Agent | 说明 |
|------|---------------|------|
| Step 5 Phase A | architect + tester + recorder | 并行设计阶段 |
| Step 8 前 | planner | 规划阶段 |
| Step 9 前 | tech-designer | 技术设计阶段 |
| Step 10 | developer-1（+ developer-2, developer-3） | 根据可并行任务数决定实例数 |

**多 developer 并行规则：**

| 可并行任务数 | developer 实例数 | 策略 |
|-------------|-----------------|------|
| 1 | 1 | 单个 developer |
| 2-3 | 2 | developer-1, developer-2 |
| 4+ | 3 | developer-1, developer-2, developer-3（上限 3） |

不同 developer 不应修改相同文件，有冲突的任务串行执行。

## 分支类型判断

根据功能描述关键词自动判断：

- 包含 "修复"、"bug"、"fix"、"错误" -> `fix/<slug>`
- 包含 "重构"、"refactor"、"优化"、"清理" -> `refactor/<slug>`
- 默认 -> `feat/<slug>`

## 验证策略

- 验证命令来自 `.dev/config.yml` 的 `verification.commands`（优先）或 PLAN.md 的验证字段
- 验证失败时，tester 和 developer 协作根因分析
- 最多重试 2 轮，仍失败则记录 FAILED 继续下一个任务

## 经验记录

每个阶段完成后自动在后台 spawn recorder 记录经验，不阻断主流程：

| 阶段 | 触发时机 |
|------|---------|
| product | 产品讨论完成后 |
| architecture | 架构设计完成后 |
| test_design | 测试设计完成后 |
| planning | 任务规划完成后 |
| tech_design | 技术设计完成后 |
| development | 每个开发任务完成后 |
| verification | 验证通过后 |
| acceptance | 验收完成后 |

## 输出示例

启动时：

```
================================================================
 DEV WORKFLOW STARTED
================================================================
 功能: 添加用户登录功能
 分支: feat/user-login
================================================================
```

完成时：

```
================================================================
 DEV WORKFLOW COMPLETE
================================================================
 功能: 添加用户登录功能
 分支: feat/user-login
 任务: 完成 5/5
 测试: 通过 12/12
 提交: 8 个
 验收说明书: .dev/plan/feat/user-login/ACCEPTANCE.md

 下一步:
   验收测试  -- 按验收说明书确认功能
   /dev:status   -- 查看工作流状态
   /git:finish   -- 合并到 develop
================================================================
```

## 注意事项

- 工作流是 **先设计再开发**，不是边写边想
- 工作流支持 **并行开发**，多个 developer 可同时执行无文件冲突的任务
- 主命令 **只做调度**，所有技术工作委托给子 Agent
- 不要自动执行 `/git:finish`，由用户自行决定合并时机
- 如果中途中断，使用 `/dev:resume` 恢复
- 上下文使用超过 60% 时，编排器会输出进度摘要并建议 `/dev:resume`

## 相关命令

- [/dev:status](./status) -- 查看工作流状态
- [/dev:resume](./resume) -- 恢复中断的工作流
- [/git:finish](../git/finish) -- 完成并合并分支

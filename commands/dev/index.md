# [dev] 开发工作流命令

多 Agent 协作开发工作流命令集，自动化完成从需求到验收的完整开发周期。

## 可用命令

| 命令 | 用途 |
|------|------|
| `/dev:start [描述]` | 启动完整开发工作流（产品→测试设计→架构→规划→技术设计→开发→验证） |
| `/dev:status` | 查看当前工作流状态和进度 |
| `/dev:resume` | 恢复中断的工作流 |

## 工作流程

```
/dev:start <功能描述>
    ↓
1. 创建分支 (feat/fix/refactor) + 初始化 .dev/config.yml
    ↓
2. 产品讨论 → dev-product Agent（与用户交互，输出 PRD）
    ↓
3. 测试设计 → dev-tester Agent（基于 PRD 生成测试用例）
    ↓
4. 架构设计 → dev-architect Agent（模块划分、接口定义）
    ↓
5. 架构自审 → dev-architect Agent（审查修正）
    ↓
6. 任务规划 → dev-planner Agent（任务分解 + 配置发现）
    ↓
7. 技术设计 → dev-tech-designer Agent（每个任务的实现策略）
    ↓
8. 开发 → dev-developer Agent（逐任务执行 + 提交）
    ↓
9. 验证 → 编排器直接执行验证命令
    ↓
用户自行 /git:finish 合并分支
```

## Agent 列表

| Agent | 模型 | 职责 |
|-------|------|------|
| dev-product | opus | 需求讨论、项目发现、PRD 输出 |
| dev-architect | opus | 高层架构设计、模块划分 |
| dev-planner | opus | 任务分解、build/test 配置发现 |
| dev-tech-designer | sonnet | 详细技术实现方案 |
| dev-developer | sonnet | 代码实现、提交 |
| dev-tester | sonnet | 测试用例设计、测试执行 |
| dev-recorder | sonnet | 经验记录（后台） |

## 产物文件

每次工作流生成在 `.dev/plan/<branch-name>/` 下：

`PRD.md` → `TEST-DESIGN.md` → `ARCHITECTURE.md` → `PLAN.md` → `TECH-DESIGN.md` → `TASK-LOG.md` → `ACCEPTANCE.md`

## 相关命令

- [/git:start-feat](../git/start-feat) - 手动创建功能分支
- [/git:commit](../git/commit) - 智能提交
- [/git:finish](../git/finish) - 完成并合并分支
- [/test:generate](../test/generate) - 手动生成测试

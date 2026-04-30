# [dev] 开发工作流命令

多 Agent 协作开发工作流命令集，自动化完成从需求讨论到验收的完整开发周期。

## 可用命令

| 命令 | 用途 |
|------|------|
| `/dev:start [描述]` | 启动完整开发工作流（需求→规划→测试设计→开发→验证） |
| `/dev:status` | 查看当前工作流状态和进度 |
| `/dev:resume` | 恢复中断的工作流 |

## 工作流程

```
/dev:start <功能描述>
    ↓
1. 创建分支 (feat/fix/refactor)
    ↓
2. 产品讨论 → dev-product Agent 与用户讨论需求、绘制线框图（唯一人类介入点）
    ↓
3. 规划 → dev-planner Agent 基于 PRD 生成任务分解
    ↓
4. 测试设计 → dev-tester Agent 生成测试用例文档（先想清楚要测什么）
    ↓
5. 开发循环（逐任务）：
   dev-developer 开发 → 验证 → 下一个任务
    ↓
6. 验收 → 生成验收说明书
    ↓
用户自行 /git:finish 合并分支
```

## Agent 列表

| Agent | 职责 |
|-------|------|
| dev-product | 产品经理 — 需求讨论、线框图、PRD |
| dev-planner | 规划 — 任务分解、依赖分析 |
| dev-developer | 开发 — 逐任务编码实现 |
| dev-tester | 测试 — 测试用例设计 + 测试执行 |
| dev-recorder | 记录 — 项目经验沉淀 |

## 相关命令

- [/git:start-feat](../git/start-feat) - 手动创建功能分支
- [/git:commit](../git/commit) - 智能提交
- [/git:finish](../git/finish) - 完成并合并分支
- [/test:generate](../test/generate) - 手动生成测试

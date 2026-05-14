# auto 工作流

即兴编排模式。由 workflow-architect 动态设计团队流程，适用于不匹配任何预设工作流的场景。执行后可沉淀为可复用模板。

## 调用

```bash
/dev:run auto [--git|--no-git] <任务描述>
```

## 参数

| 参数 | 说明 |
|------|------|
| `--git` | 使用 git（默认行为），创建分支 |
| `--no-git` | 跳过 git，在当前分支工作 |
| `任务描述` | 任何开发任务的描述 |

## 适用场景

- 任务不匹配任何预设工作流（不是单纯的 fix/feat/refactor）
- 跨类型复合任务（如迁移同时涉及重构 + 新功能 + 测试）
- 不确定该怎么做的探索性工作
- 多步骤复合任务

## 不适用

- 任务明确匹配某个预设工作流 — 直接用那个工作流更高效

## 执行流程

```
/dev:run auto 把项目从 JavaScript 迁移到 TypeScript
    |
Step 1: 解析参数 + 创建分支（可选）
    |
Step 2: 工作流架构师设计工作流 -- dev-workflow-architect (opus)
|        输出 WORKFLOW.md（步骤、并行策略、人类介入点）
    |
Step 3: 用户确认/调整工作流
|        按设计执行 / 简化流程 / 取消
    |
Step 4: 按工作流逐步执行
|        根据步骤表 spawn 对应 Agent
|        支持并行执行无依赖的步骤
|        人类介入点暂停等用户确认
    |
Step 5: 提议沉淀（保存为可复用模板）
    |
Step 6: 验收 -> ACCEPTANCE.md
    |
Done.
```

## 可用 Agent

架构师设计工作流时，可从以下 Agent 中按需组装：

| Agent | 模型 | 能力 |
|-------|------|------|
| dev-product | opus | 需求讨论、PRD 输出 |
| dev-architect | opus | 架构设计、代码分析 |
| dev-planner | opus | 任务分解 |
| dev-tech-designer | sonnet | 详细技术方案 |
| dev-developer | sonnet | 代码实现、提交 |
| dev-tester | sonnet | 测试设计和执行 |
| dev-recorder | sonnet | 知识记录 |

## 产物文件

| 文件 | 说明 |
|------|------|
| WORKFLOW.md | 架构师设计的工作流 |
| ACCEPTANCE.md | 验收说明书 |
| 其他 | 视工作流设计而定 |

## 设计原则

1. **最小步骤** — 能用 2 步解决就不用 5 步
2. **按需组装** — 只调用必要的 Agent，不搞全套流水线
3. **人类在环** — 复杂决策点让用户参与，简单步骤自动执行
4. **可中断** — 任何步骤失败都可以 `/dev:resume` 恢复

## 沉淀工作流

执行完成后，系统会询问是否保存为可复用模板。保存后，工作流文件写入 `.dev/workflows/<name>.md`，后续可通过 `/dev:run <name>` 直接调用。

## 相关命令

- [/dev:run feat](./feat) -- 新功能开发
- [/dev:run fix](./fix) -- Bug 修复
- [/dev:run refactor](./refactor) -- 代码重构
- [/dev:status](./status) -- 查看工作流状态
- [/dev:resume](./resume) -- 恢复中断的工作流

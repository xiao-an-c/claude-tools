# refactor 工作流

代码重构模式，架构师驱动。识别代码坏味道，制定重构计划，逐步原子化实施。每步保持测试通过。

## 调用

```bash
/dev:run refactor [--git|--no-git] <重构描述>
```

## 参数

| 参数 | 说明 |
|------|------|
| `--git` | 创建 `refactor/<slug>` 分支（默认行为） |
| `--no-git` | 不创建分支，在当前分支上工作 |
| `重构描述` | 重构范围和目标描述 |

## 适用场景

- 代码结构改善（提炼函数、提炼类、搬移函数等）
- 消除重复代码
- 简化条件逻辑
- 改善命名、接口设计
- 模块拆分或合并
- 类型统一、模式替换
- 任何"不改变外部行为，只改善内部结构"的改动

## 不适用

- 新功能开发（用 `/dev:run feat`）
- Bug 修复（用 `/dev:run fix` 或 `/dev:run patch`）
- 需要新测试设计的改动（重构应保持现有测试通过）

## 执行流程

```
/dev:run refactor 重构 src/utils 工具函数，消除重复代码
    |
Step 1: 解析输入（--git/--no-git + 重构描述）
    |
Step 2: 创建分支 refactor/<slug> from develop
    |
Step 3: 初始化状态目录 + .dev/config.yml
    |
Step 4: 架构分析 -- dev-architect (opus)
|        识别代码坏味道，输出重构计划 -> ARCHITECTURE.md
    |
Step 5: 任务规划 -- dev-planner (opus) -> PLAN.md
    |
Step 6-8: 开发循环（逐任务顺序执行）
|   Step 6:  dev-developer (sonnet) 执行单个重构步骤
|   Step 7:  dev-recorder (后台) 记录重构手法
|   Step 8:  验证（测试必须通过，行为保持）+ 合并子分支
|           -> 回到 Step 6 或退出循环
    |
Step 9: 任务循环决策
    |
Step 10: 生成 ACCEPTANCE.md（前后对比 + 重构清单）
    |
Step 11: 显示摘要，建议 /git:finish
```

## 核心原则

1. **架构师驱动** — 无 Product Agent、无 PRD，架构师直接分析代码
2. **行为保持** — 重构不改变外部行为，现有测试必须始终通过
3. **原子步骤** — 每个重构手法独立执行、独立验证、独立提交
4. **小步前进** — 遵循 Martin Fowler 的两顶帽子原则

## Agent 团队

| 角色 | Agent | 模型 | 说明 |
|------|-------|------|------|
| 架构分析 | dev-architect | opus | 识别代码坏味道，制定重构计划 |
| 任务规划 | dev-planner | opus | 将重构步骤拆分为原子任务 |
| 开发执行 | dev-developer | sonnet | 逐任务执行重构 |
| 经验记录 | dev-recorder | sonnet | 后台记录重构手法和发现 |

**无 Product Agent、无 Tester Agent。** 重构不涉及需求讨论和新测试设计。

## 产物文件

输出到 `.dev/plan/refactor-<slug>/`：

| 文件 | 说明 |
|------|------|
| ARCHITECTURE.md | 代码坏味道分析 + 重构计划 |
| PLAN.md | 原子任务分解 |
| TASK-LOG.md | 执行记录 |
| ACCEPTANCE.md | 验收说明书（前后对比） |

## 使用示例

```bash
/dev:run refactor 重构工具函数，消除重复代码
/dev:run refactor --no-git 简化 Login 组件的条件逻辑
```

## 相关命令

- [/dev:run feat](./feat) -- 新功能开发
- [/dev:run fix](./fix) -- Bug 修复
- [/dev:review](./review) -- 代码审查（发现需要重构的代码）
- [/dev:status](./status) -- 查看工作流状态
- [/git:finish](../git/finish) -- 完成并合并分支

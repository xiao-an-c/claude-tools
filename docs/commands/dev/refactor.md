# /dev:refactor

代码重构模式，架构师驱动。识别代码坏味道，制定重构计划，逐步原子化实施。

## 用法

```bash
/dev:refactor [--git|--no-git] <重构描述>
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
- 任何"不改变外部行为，只改善内部结构"的改动

## 不适用

- 新功能开发 -- 用 `/dev:feat`
- Bug 修复 -- 用 `/dev:fix` 或 `/dev:patch`
- 小改动 -- 用 `/dev:patch`

## 执行流程

```
/dev:refactor 重构 src/utils 工具函数，消除重复代码
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
Step 5: 用户确认重构计划
    |
Step 6: 任务规划 -- dev-planner (opus) -> PLAN.md
    |
Step 7-9: 开发循环（逐任务）
|   Step 7:  dev-developer (sonnet) 执行单个重构步骤
|   Step 8:  dev-recorder (后台) 记录重构手法
|   Step 9:  验证（测试必须通过，行为保持）
|           -> 回到 Step 7 或退出循环
    |
Step 10: 生成 ACCEPTANCE.md（前后对比 + 重构清单）
    |
Step 11: 显示摘要，建议 /git:finish
```

## 核心原则

1. **架构师驱动** -- 无 Product Agent、无 PRD，架构师直接分析代码
2. **行为保持** -- 重构不改变外部行为，现有测试必须始终通过
3. **原子步骤** -- 每个重构手法独立执行、独立验证、独立提交
4. **小步前进** -- 遵循 Martin Fowler 的两顶帽子原则

## Agent 团队

| 角色 | Agent | 模型 | 说明 |
|------|-------|------|------|
| 架构分析 | dev-architect | opus | 识别代码坏味道，制定重构计划 |
| 任务规划 | dev-planner | opus | 将重构步骤拆分为原子任务 |
| 开发执行 | dev-developer | sonnet | 逐任务执行重构 |
| 经验记录 | dev-recorder | sonnet | 后台记录重构手法和发现 |

**无 Product Agent、无 Tester Agent。** 重构不涉及需求讨论和新测试设计。

## 产物文件

| 文件 | 说明 |
|------|------|
| ARCHITECTURE.md | 代码坏味道分析 + 重构计划 |
| PLAN.md | 原子任务分解 |
| TASK-LOG.md | 执行记录 |
| ACCEPTANCE.md | 验收说明书（前后对比） |

## 使用示例

```bash
/dev:refactor 重构工具函数，消除重复代码
/dev:refactor --no-git 简化 Login 组件的条件逻辑
```

## 相关命令

- [/dev:feat](./feat) -- 新功能开发
- [/dev:fix](./fix) -- Bug 修复
- [/dev:review](./review) -- 代码审查（发现需要重构的代码）
- [/dev:status](./status) -- 查看工作流状态
- [/git:finish](../git/finish) -- 完成并合并分支

# feat 工作流

新功能开发模式，旗舰级工作流。自适应复杂度，完整团队协作（产品 + 架构 + 测试 + 规划 + 开发）。

## 调用

```bash
/dev:run feat [--git|--no-git] <功能描述>
```

## 参数

| 参数 | 说明 |
|------|------|
| `--git` | 启用 git 分支管理（默认行为），创建 `feat/<slug>` 分支 |
| `--no-git` | 禁用 git 操作，不创建分支、不提交代码 |
| `功能描述` | 要开发的功能描述，支持中文 |

不指定 `--git` 或 `--no-git` 时，默认 `use_git=true`。

## 适用场景

- 新功能开发（任何规模）
- 需要产品需求讨论的改动
- 涉及多模块、多文件的变更
- 需要测试设计的功能

## 不适用

- 小改动，已知怎么改（用 `/dev:run patch`）
- Bug 修复（用 `/dev:run fix`）
- 代码结构改善，不改外部行为（用 `/dev:run refactor`）
- 紧急线上修复（用 `/dev:run hotfix`）

## 执行流程

```
/dev:run feat 添加用户登录功能
    |
Step 1: 解析输入（提取 --git/--no-git 和功能描述）
    |
Step 2: 创建分支 feat/<slug> from develop（use_git=true 时）
    |
Step 3: 初始化状态目录 + .dev/config.yml
    |
Step 4: 产品讨论 -- dev-product (opus) ★ 唯一人类交互点
    |
Step 5: 复杂度评估（读取 PRD，判断 simple/complex）
    |
Step 6: 并行 -- 测试设计 + 架构设计（tester + architect 同时工作）
    |
Step 7: 任务规划 -- dev-planner (opus)
    |
  ┌────────────┬────────────────┐
  │ Simple     │ Complex        │
  │ 跳过技术设计│ Step 8a: 架构自审│
  │            │ Step 8b: 技术设计│
  └────────────┴────────────────┘
    |
Step 9: 开发循环（逐任务 spawn developer，支持并行）
    |        每个任务完成后：recorder 后台记录 + 验证 + 合并子分支
    |
Step 10: Recorder -- 每任务完成后后台触发
    |
Step 11: 验证（build/lint/test）
    |
Step 12: 验收 -- ACCEPTANCE.md
    |
Step 13: 显示摘要，建议 /git:finish
```

## 自适应复杂度

不在开始时决定复杂度，而是在架构设计 + 测试设计完成后评估：

| 维度 | 简单 (simple) | 复杂 (complex) |
|------|--------------|----------------|
| 用户故事 | 1-3 | 4+ |
| 预估变更文件 | 1-3 | 4+ |
| 是否涉及新模块 | 否 | 是 |

- **简单** — 跳过技术设计，直接进入开发
- **复杂** — 架构师自审 → 技术设计 → 开发

## Agent 团队

| 角色 | Agent | 模型 | 说明 |
|------|-------|------|------|
| 产品 | dev-product | opus | 与用户讨论需求，输出 PRD（唯一人类交互点） |
| 架构设计 | dev-architect | opus | 系统架构设计 |
| 测试设计 | dev-tester | sonnet | 测试用例设计 |
| 规划 | dev-planner | opus | 任务分解 |
| 技术设计 | dev-tech-designer | sonnet | 仅 complex 模式 |
| 开发 | dev-developer | sonnet | 代码实现（可并行，最多 3 个） |
| 记录 | dev-recorder | sonnet | 经验记录（后台） |

## 产物文件

所有产物输出到 `.dev/plan/<branch-name>/`：

| 文件 | 说明 |
|------|------|
| PRD.md | 产品需求文档 |
| TEST-DESIGN.md | 测试用例设计 |
| ARCHITECTURE.md | 架构设计 |
| PLAN.md | 任务分解计划 |
| TECH-DESIGN.md | 技术设计（仅 complex） |
| TASK-LOG.md | 执行记录 |
| ACCEPTANCE.md | 验收说明书 |

## 使用示例

```bash
/dev:run feat 添加用户登录功能
/dev:run feat --no-git 添加暗色主题切换
/dev:run feat --git 实现文件上传和预览
```

## 注意事项

- 工作流是先设计再开发，不是边写边想
- 支持并行开发，多个 developer 可同时执行无文件冲突的任务
- 如果中途中断，使用 `/dev:resume` 恢复

## 相关命令

- [/dev:status](./status) -- 查看工作流状态
- [/dev:resume](./resume) -- 恢复中断的工作流
- [/dev:run fix](./fix) -- Bug 修复模式
- [/dev:run patch](./patch) -- 超轻量补丁模式
- [/git:finish](../git/finish) -- 完成并合并分支

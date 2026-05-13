# /dev:fix

Bug 修复模式，架构师诊断根因 + 开发者实施修复。自包含工作流，独立运行。

## 用法

```bash
/dev:fix [--git|--no-git] <问题描述>
```

## 参数

| 参数 | 说明 |
|------|------|
| `--git` | 创建 `fix/<slug>` 分支（默认行为） |
| `--no-git` | 不创建分支，在当前分支上直接修复 |
| `问题描述` | Bug 的症状描述，支持中文 |

## 适用场景

- 已知 bug，需要诊断根因并修复
- 线上问题快速响应（非 hotfix 级别）
- 用户反馈的缺陷，需要分析 + 修复
- 需要比 `/dev:patch` 更严格的流程（文档、验证、验收）

## 不适用

- 一行修改、配置调整 -- 用 `/dev:patch`
- 紧急线上 hotfix -- 用 `/dev:hotfix`
- 大规模重构 -- 用 `/dev:refactor`

## 执行流程

```
/dev:fix 登录后页面白屏，控制台报 TypeError
    |
Step 1: 解析参数（use_git + 问题描述）
    |
Step 2: 创建分支 fix/<slug> from develop（use_git=true 时）
    |
Step 3: 初始化状态目录 + .dev/config.yml
    |
Step 4: 架构师诊断 -- dev-architect (opus) -> PRD.md (Bug Report)
    |
Step 5: 用户确认诊断结果
    |
Step 6: 开发者修复 -- dev-developer (sonnet)
    |
Step 7: 验证（build/lint/test）
    |
Step 8: 记录 -- dev-recorder (sonnet)
    |
Step 9: 验收 -> ACCEPTANCE.md
    |
Step 10: 显示摘要
```

预期耗时：5-10 分钟。

## Agent 团队

| 角色 | Agent | 模型 | 说明 |
|------|-------|------|------|
| 诊断 | dev-architect | opus | 根因分析、修复方案 |
| 修复 | dev-developer | sonnet | 实施修复 |
| 记录 | dev-recorder | sonnet | 经验记录 |

## 产物文件

| 文件 | 说明 |
|------|------|
| PRD.md | Bug 报告（症状、根因、修复方案） |
| TASK-LOG.md | 执行记录 |
| ACCEPTANCE.md | 验收说明书 |

## 使用示例

```bash
/dev:fix 登录后页面白屏
/dev:fix --no-git 修复表单验证不生效的问题
```

## 相关命令

- [/dev:patch](./patch) -- 超轻量补丁（已知原因的小修复）
- [/dev:hotfix](./hotfix) -- 紧急线上修复
- [/dev:investigate](./investigate) -- 只排查不修复
- [/dev:status](./status) -- 查看工作流状态
- [/dev:resume](./resume) -- 恢复中断的工作流
- [/git:finish](../git/finish) -- 完成并合并分支

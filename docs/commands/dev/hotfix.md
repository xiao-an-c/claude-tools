# hotfix 工作流

紧急修复模式。线上出事时的最小流程、最大速度。从 main 创建 hotfix 分支，快速诊断并修复。

## 调用

```bash
/dev:run hotfix [--git|--no-git] <问题描述>
```

## 参数

| 参数 | 说明 |
|------|------|
| `--git` | 使用 git（默认行为），从 main/master 创建 `hotfix/<slug>` 分支 |
| `--no-git` | 跳过 git，在当前分支工作（不推荐） |
| `问题描述` | 线上问题的描述 |

## 适用场景

- 生产环境故障，需要立即修复
- 线上 bug 导致用户受影响
- 需要绕过正常流程的紧急情况

## 不适用

- 非紧急的常规 bug（用 `/dev:run fix`）
- 需要详细诊断和测试设计（用 `/dev:run fix` 或 `/dev:investigate`）
- 大规模重构（用 `/dev:run refactor`）

## 执行流程

```
/dev:run hotfix 线上登录接口返回500
    |
Step 1: 解析参数 + 创建 hotfix/* 分支（从 main/master）
    |
Step 2: 初始化状态
    |
Step 3: 架构师快速诊断 + PRD (opus) -> PRD.md (Bug Report)
    |
Step 4: 快速规划 -- dev-planner (opus) -> PLAN.md
    |
Step 5: 开发者实现修复 (sonnet)
    |
Step 6: 最小验证（build + 现有测试）
    |
Step 7: Recorder (sonnet)
    |
Step 8: 验收 -> ACCEPTANCE.md + 提示 /git:finish
```

## 与其他修复工作流的区别

| | patch | fix | hotfix |
|---|---|---|---|
| 紧急程度 | 低 | 中 | 高 |
| 分支来源 | 无 | develop | main/master |
| 文档 | 无 | Bug Report + ACCEPTANCE | ACCEPTANCE |
| 诊断深度 | 无 | 完整诊断 | 快速诊断 |
| 预期耗时 | 2-3 min | 5-10 min | 3-5 min |

## 注意事项

- hotfix 分支需要合并到 main + develop，完成后请运行 `/git:finish`
- 如果信息不足，建议先切换到 `/dev:investigate` 排查

## 相关命令

- [/dev:run fix](./fix) -- 常规 Bug 修复
- [/dev:investigate](./investigate) -- Bug 排查（只读）
- [/dev:run patch](./patch) -- 超轻量补丁
- [/git:finish](../git/finish) -- 完成并合并分支

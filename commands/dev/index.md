# [dev] 开发工作流命令

多 Agent 协作开发工作流命令集，自动化完成从规划到测试的完整开发周期。

## 可用命令

| 命令 | 用途 |
|------|------|
| `/dev:start [描述]` | 启动完整开发工作流（规划→开发→测试） |
| `/dev:status` | 查看当前工作流状态和进度 |
| `/dev:resume` | 恢复中断的工作流 |

## 工作流程

```
/dev:start <功能描述>
    ↓
1. 创建分支 (feat/fix/refactor)
    ↓
2. 规划 → dev-planner Agent 生成任务分解
    ↓
3. 开发 → dev-developer Agent 逐任务执行
    ↓
4. 测试 → dev-tester Agent 编写测试并验证
    ↓
用户自行 /git:finish 合并分支
```

## 相关命令

- [/git:start-feat](../git/start-feat) - 手动创建功能分支
- [/git:commit](../git/commit) - 智能提交
- [/git:finish](../git/finish) - 完成并合并分支
- [/test:generate](../test/generate) - 手动生成测试

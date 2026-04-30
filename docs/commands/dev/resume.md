# /dev:resume

恢复中断的开发工作流，从上次进度继续执行。

## 用法

```bash
/dev:resume
```

## 恢复点判断

命令会自动检测工作流中断位置：

| 条件 | 恢复点 | 动作 |
|------|--------|------|
| PRD.md 不存在 | **Step 4** | spawn dev-product 进行产品讨论 |
| PRD.md 存在，PLAN.md 不存在 | **Step 5** | spawn dev-planner 基于 PRD 规划 |
| PLAN.md 存在，TEST-DESIGN.md 不存在 | **Step 6** | spawn dev-tester 生成测试用例文档 |
| PLAN.md + TEST-DESIGN.md 存在，有待执行任务 | **Step 7** | spawn dev-developer 继续开发 |
| 所有任务完成，ACCEPTANCE.md 不存在 | **Step 10** | 生成验收说明书 |
| ACCEPTANCE.md 已存在 | 已完成 | 提示工作流已完成 |
| 有 FAILED 任务 | Step 7 | 询问用户：重试/跳过/终止 |
| 有 BLOCKED 任务 | Step 7 | 询问用户如何处理阻塞 |

## 输出示例

```
================================================================
 DEV WORKFLOW RESUMED
================================================================
 分支: feat/user-login
 恢复点: Step 7 - 继续开发
 剩余任务: 3 个
================================================================
```

## 注意事项

- 必须在 `feat/*`、`fix/*` 或 `refactor/*` 分支执行
- 需要有 `.dev/plan/<branch>/` 目录和对应的状态文件
- 如果没有活跃的工作流，使用 `/dev:start` 启动新工作流

## 相关命令

- [/dev:start](./start) — 启动新工作流
- [/dev:status](./status) — 查看工作流状态
- [/git:finish](../git/finish) — 完成并合并分支

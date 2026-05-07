### 添加新 Agent 的三处同步点

在 `agents/` 目录下新增 agent 文件后，需要同步更新三处：

1. **`bin/cli.js` 的 `CATEGORY_AGENT_DEPS`** — 将 agent 文件名加入对应命令类别的依赖数组
2. **`__tests__/cli.test.js`** — 更新 `loadAgents`、`CATEGORY_AGENT_DEPS`、安装相关测试中的断言（包括 `arrayContaining` 和 `toHaveLength`）
3. **Workflow 文档**（如 `docs/commands/dev/start.md`）— 如果 agent 参与工作流，更新流程步骤和 spawn 策略说明

漏掉任何一处都会导致测试失败或运行时行为不一致。

- 发现于: verification/refactor/workflow-optimization
- 相关文件: bin/cli.js, __tests__/cli.test.js, docs/commands/dev/start.md

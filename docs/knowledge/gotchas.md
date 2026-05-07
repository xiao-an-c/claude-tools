### CATEGORY_AGENT_DEPS 是手动维护的注册表

`bin/cli.js` 中的 `CATEGORY_AGENT_DEPS` 对象是命令类别到 agent 文件名的映射，**不会自动发现**新增的 agent 文件。添加新 agent（如 `dev-architect.md`）后，必须手动将其文件名（不含 `.md`）追加到对应类别的数组中，否则安装命令会遗漏该 agent。

- 发现于: verification/refactor/workflow-optimization
- 相关文件: bin/cli.js, agents/

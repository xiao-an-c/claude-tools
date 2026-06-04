# Claude Tools

可扩展的 Claude Code 技能集，通过 `npx skills add` 分发。

## 安装

### `npx skills add`（推荐）

```bash
# 安装 Git 工作流技能
npx skills add xiao-an-c/claude-tools -s git-flow

# 安装多 Agent 开发工作流技能
npx skills add xiao-an-c/claude-tools -s dev-flow

# 同时安装两个
npx skills add xiao-an-c/claude-tools -s git-flow -s dev-flow
```

### Claude Code 插件市场

```
/plugin marketplace add xiao-an-c/claude-tools
/plugin install git-flow@claude-tools
/plugin install dev-flow@claude-tools
```

## 技能列表

### git-flow

Git Flow 分支管理工作流，支持 Epic Branching 父子分支模式。

触发场景：创建分支、提交代码、同步合并、发布版本、紧急修复、查看分支状态。

### dev-flow

多 Agent 协作开发工作流，编排 8 个专项 Agent 覆盖完整开发生命周期。

触发场景：功能开发、Bug 修复、代码重构、代码审查、问题调查、技术讨论。

## 项目结构

```
skills/
  git-flow/           ← Git Flow 技能
  dev-flow/           ← 多 Agent 开发技能
.claude-plugin/
  marketplace.json        ← 插件市场注册
```

## License

MIT

# Dev 工作流

Claude Code 的多 Agent 协作开发工作流 Skill。编排 8 个专项 Agent，覆盖完整开发生命周期。

## 覆盖范围

- **5 种工作流**：patch、fix、feat、refactor、hotfix
- **8 个专项 Agent**：产品经理、架构师、规划师、技术设计师、开发者、测试工程师、工作流架构师、知识记录者
- **状态管理**：`.dev/plan/` 持久化，含 PRD、架构设计、测试设计、任务日志
- **复杂度评估**：自动识别简单/复杂，自适应工作流步骤

## 触发场景

本技能需要用户**显式调用** `/dev-flow` 命令。使用方式：

```
/dev-flow feat 用户登录功能        # 功能开发
/dev-flow fix 分页 bug             # Bug 修复
/dev-flow hotfix 线上支付失败       # 紧急修复
/dev-flow patch 改个配置           # 轻量补丁
/dev-flow refactor 重构 utils      # 代码重构
/dev-flow discuss 用 Redis 还是 PG  # 架构讨论
/dev-flow review src/routes/       # 代码审查
/dev-flow investigate API 为什么慢  # Bug 排查
/dev-flow status                    # 查看状态
/dev-flow                           # 显示命令指南
```

## Agent 团队

| Agent | 角色 |
|-------|------|
| dev-product | 产品经理 — 唯一与您交互的 Agent |
| dev-architect | 系统架构师 — 设计模块结构 |
| dev-planner | 任务规划师 — 拆解工作为任务 |
| dev-tech-designer | 技术设计师 — 架构到实现的桥梁 |
| dev-developer | 开发者 — 编写代码 |
| dev-tester | 测试工程师 — 设计和执行测试 |
| dev-flow-architect | 工作流设计师 — 动态编排工作流 |
| dev-recorder | 知识记录者 — 捕获可复用洞察 |

## 安装

```bash
npx skills add xiao-an-c/claude-tools -s dev-flow
```

### 更新

```bash
npx skills update dev-flow         # 更新到最新版本
npx skills update                  # 更新所有已安装技能
npx skills update -g               # 只更新全局技能
```

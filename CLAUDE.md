# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

claude-tools 是一个可扩展的 Claude Code 斜杠命令集，通过 `npx` 安装。提供 Git 工作流命令（基于 Git Flow）、测试辅助命令、以及多 Agent 协作的开发工作流（`/dev:*`），编排产品、架构、编码、测试等专项 Agent。

CLI（`bin/cli.js`）将 Markdown 命令文件和 Agent 定义复制到目标项目的 `.claude/commands/` 和 `.claude/agents/` 目录。实际"执行"由 Claude Code 在运行时解释这些 Markdown 提示词完成。

## 常用命令

```bash
npm test                    # 运行全部测试（Jest）
npm run test:watch          # Jest 监听模式
npm run test:coverage       # Jest 覆盖率（输出到 coverage/）
npm run docs:dev            # VitePress 文档开发服务器
npm run docs:build          # 构建 VitePress 文档
```

CLI 本身无需构建 —— `bin/cli.js` 以 CommonJS 直接运行。

## 架构

### Markdown 即命令

`commands/` 下的每个 `.md` 文件即一条斜杠命令（如 `commands/git/commit.md` → `/git:commit`）。文件包含 YAML frontmatter 元数据和自然语言指令，由 Claude Code 解释执行。子目录即命令类别（`git/`、`test/`、`dev/`）。

### 多 Agent 开发工作流

`/dev:*` 命令通过 `Agent()` 编排 8 个专项 Agent：

| Agent | 模型 | 职责 |
|-------|------|------|
| dev-product | opus | 产品经理 —— 唯一与人类交互的 Agent |
| dev-architect | opus | 系统架构师 |
| dev-planner | opus | 任务规划师 |
| dev-tech-designer | sonnet | 架构到实现的桥梁 |
| dev-developer | sonnet | 代码实现者 |
| dev-tester | sonnet | 测试工程师 |
| dev-workflow-architect | opus | 工作流架构师（复杂度评分、RACI、BPMN 模式） |
| dev-recorder | sonnet | 知识记录者（严格质量过滤） |

Agent 定义在 `agents/` 目录。

### 工作流即知识

工作流定义存储在 `workflows/` 目录（包内置）和 `.dev/workflows/`（项目级，可定制）。

- `/dev:run <workflow>` 是通用执行器——读取工作流定义文件，机械执行每一步
- `/dev:run auto` 在无匹配工作流时触发 `dev-workflow-architect` 动态设计工作流
- 执行完动态工作流后可提议沉淀到 `.dev/workflows/` 供以后复用
- 内置工作流：`patch`（超轻量）、`fix`（bug 修复）、`feat`（功能开发）、`refactor`（重构）、`hotfix`（紧急修复）

安装时 `bin/cli.js` 将 `workflows/` 复制到 `.dev/workflows/`（不覆盖已有文件）。

### 状态持久化

开发工作流状态保存在目标项目的 `.dev/` 目录：
- `.dev/config.yml` —— 项目配置
- `.dev/plan/<分支名>/` —— PRD、架构设计、任务计划、测试设计、执行日志、验收报告

### 类别动态发现

`bin/cli.js` 动态扫描 `commands/` 发现类别，新增子目录和 `.md` 文件即自动成为可安装类别。但 `CATEGORY_AGENT_DEPS` 是手动注册表 —— 新增 Agent 必须手动添加。

## 关键约束：新增/修改 Agent 需同步三处

遗漏任何一处都会导致测试失败或运行时行为不一致：

1. **`bin/cli.js`** —— `CATEGORY_AGENT_DEPS` 映射（手动维护，不会自动发现）
2. **`__tests__/cli.test.js`** —— 更新 `loadAgents`、依赖断言、安装相关断言
3. **文档** —— 如果 Agent 参与工作流，需更新流程文档

## Git 分支模型

基于 Git Flow，支持 Epic 分支。子分支遵循 `<type>/<slug>-t<NN>` 命名规则，自动识别父分支。完整规范见 `docs/specs/git-branch-spec.md`。

## 设计哲学

整个命令体系围绕一个核心思路：**将不确定性转化为确定性**。但确定性不是一次性达成的 —— 它是一个持续转动的飞轮：

**收敛 —— 能确定的先确定。** 每条命令都是对开发流程的收敛：固定的阶段、明确的角色分工、预定义的产出物，消除"接下来该做什么"的歧义。Git 分支规范、commit 格式、工作流阶段门控，都是在缩小自由度，让错误无处发生。

**探索 —— 确定不了的，结构化探索。** 无法匹配已知模式时（`/dev:auto` 即兴编排），方案不确定时（`/dev:discuss` 多角色会议），原因未知时（`/dev:investigate` 分层诊断 + 置信度标注），系统不假装有答案，而是提供受控的探索空间。核心原则：不确定时不做不可逆操作，延迟决策直到信息充足。

**沉淀 —— 探索的结果严格过滤后入库。** `dev-recorder` 的四条质量门控（非显而易见、会重复遇到、省时间、不重复）确保知识库高信噪比。工作流产出物（PRD、架构设计、任务计划）持久化在 `.dev/plan/` 中，跨运行累积。

**增长 —— 沉淀的知识收窄下一轮的不确定空间。** `.dev/config.yml` 在多次运行中逐渐被填满，`docs/knowledge/` 持续积累踩过的坑，审查结果（`/dev:review`）反馈到知识库。每一轮飞轮转动，确定性的边界就往外推一点。

## 规范

- 提交信息：conventional commits，中文描述（如 `feat(dev): 添加新功能`）
- Scope 根据文件路径推导：`dev/` → `(dev)`、`git/` → `(git)` 等
- 界面和文档以中文（简体）为主
- 纯 JavaScript + Markdown，无 TypeScript
- 未配置 linter（无 ESLint/Prettier）

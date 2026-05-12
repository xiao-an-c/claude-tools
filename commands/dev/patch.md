---
name: dev_patch
description: 超轻量补丁模式，无 git 无文档，架构师+开发者直接讨论并实现
argument-hint: "<改动描述>"
allowed-tools:
  - Read
  - Bash
  - Agent
  - AskUserQuestion
---

# /dev:patch — 超轻量补丁模式

零文档、零 git、零团队。架构师快速分析方案，开发者直接实现。适用于小改动、hotfix、一行修复。

## 适用场景

- 改个配置、修个 typo、调个样式
- 小 bug fix，原因明确
- 已知怎么改，只需要执行
- 不值得走完整 `/dev:start` 流程的任何改动

## 不适用

- 涉及 3+ 文件的改动（用 `/dev:start --quick`）
- 需要新分支、PR（用 `/dev:start`）
- 需要测试设计（用 `/dev:start --standard`）

## 流程

```
用户输入: /dev:patch 修复登录按钮在移动端不显示的问题
    ↓
Step 1: 架构师(inline, opus) — 快速分析，输出方案摘要(纯文本，不写文件)
    ↓
Step 2: 向用户展示方案，确认或调整
    ↓
Step 3: 开发者(inline, sonnet) — 根据方案直接改代码
    ↓
Step 4: 运行验证（build/lint/test，如果有配置）
    ↓
Done. 不创建分支，不生成文档，不写 .dev/ 目录。
```

总耗时预期：2-3 分钟（2 次 Agent spawn + 1 次确认）。

## 执行步骤

### Step 1: 架构师快速分析

以内联方式 spawn dev-architect，但告诉它**不写文件**，只返回方案摘要：

```
Agent(
  subagent_type="dev-architect",
  model="opus",
  prompt="
    <change_request><用户输入的改动描述></change_request>
    <project_root><项目根目录绝对路径></project_root>

    快速分析这个改动，返回以下信息（不要写任何文件）：

    1. **涉及文件**: 列出需要修改的文件路径
    2. **改动方案**: 每个文件具体改什么（2-3 句话/文件）
    3. **风险点**: 是否有副作用或需要注意的地方

    如果改动描述不够明确，指出需要向用户澄清的问题。
    不要输出 ARCHITECTURE.md，不要写任何文件。
  "
)
```

### Step 2: 向用户确认方案

将架构师返回的方案用 AskUserQuestion 展示给用户：

```
AskUserQuestion(questions=[{
  header: "方案确认",
  multi_select: false,
  options: [
    { label: "执行", description: "按方案直接实现" },
    { label: "调整", description: "我想修改方案细节" },
    { label: "取消", description: "不做了" }
  ],
  question: "架构师建议的方案：<方案摘要>。确认执行？"
}])
```

- **执行** → 进入 Step 3
- **调整** → 用户补充说明后，回到 Step 1 或直接进入 Step 3
- **取消** → 结束

### Step 3: 开发者实现

根据确认的方案 spawn 开发者：

```
Agent(
  subagent_type="dev-developer",
  model="sonnet",
  prompt="
    <project_root><项目根目录绝对路径></project_root>

    直接实现以下改动（不需要 PRD、PLAN 或 TECH-DESIGN）：

    <architect_proposal>
    <架构师返回的完整方案>
    </architect_proposal>

    <user_adjustments>
    <用户调整内容，如无则为空>
    </user_adjustments>

    要求：
    - 直接修改文件，不需要创建任何设计文档
    - 实现完成后提交代码（commit message 用简洁的中文描述改动）
  "
)
```

### Step 4: 验证

检查项目是否有验证命令（package.json scripts、Makefile 等），如果有则运行：

```bash
# 检查是否有 lint/typecheck/test
# 如果有，运行对应的命令
# 如果没有，跳过验证
```

显示最终结果：

```
✓ 补丁完成
  改动: <文件列表>
  提交: <commit hash 前7位>
```

## 与其他命令的区别

| | `/dev:patch` | `/dev:start --quick` | `/dev:start --standard` |
|---|---|---|---|
| Git 分支 | ❌ | ✅ | ✅ |
| 文档生成 | ❌ | PRD + ACCEPTANCE | 全套 |
| Agent 数 | 2 (inline) | 2 (inline) | 5 (team) |
| 人类确认 | 1 次 | Product 讨论 | Product 讨论 |
| 适用改动量 | 1-2 文件 | 1-3 文件 | 3-8 文件 |
| 预期耗时 | 2-3 min | 5-8 min | 15-30 min |

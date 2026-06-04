---
name: dev_discuss
description: 架构讨论模式（只读），产品+架构师与用户讨论方案，产出会议纪要
argument-hint: "<讨论主题>"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Agent
  - AskUserQuestion
---

# dev-flow discuss — 架构讨论模式（只读）

开个会。产品经理主持，架构师做技术顾问，你做决策。不修改任何代码。

## 适用场景

- 不确定怎么实现，想讨论方案
- 技术选型犹豫，需要分析利弊
- 架构方向有争议，需要多方视角
- 想在写代码前对齐思路

## 不适用

- 已经知道怎么做，直接做（用 `dev-flow feat` 或 `dev-flow fix`）
- 想审查代码质量（用 `dev-flow review`）
- 想排查 bug（用 `dev-flow investigate`）

## Agent 加载机制

所有 Agent 通过 **Agent Loader 协议** 加载：读取 Skill Base directory 下的 `agents/<name>.md`，去除 YAML frontmatter 和团队通信段，拼接 task + params 作为最终 prompt。

## 流程

```
dev-flow discuss 用户权限系统怎么设计
    ↓
Step 1: 解析讨论主题
    ↓
Step 2: 产品经理开场，澄清问题
    ↓
Step 3: 多轮讨论（产品提问 → 架构师分析 → 你决策）
    ↓
Step 4: 产出 MINUTES.md（会议纪要）
    ↓
Step 5: Recorder（记录决策和原因）
    ↓
Done. 建议具体开发模式
```

## 执行步骤

### Step 1: 解析输入

提取讨论主题。discuss 模式不使用 git、不创建分支。

### Step 2: 产品经理开场

加载 `agents/dev-product.md`，以讨论主持模式 spawn：

- agent: dev-product
  model: opus
  task: |
    讨论主持模式（不要写 PRD，不要写文件）。
    1. 阅读项目结构和相关代码，理解当前状态
    2. 阅读知识库，了解已有约束和约定
    3. 向用户提问，澄清讨论的核心问题：
       - 你最关心什么？（性能/安全/可维护性/开发速度）
       - 有什么约束？（时间/技术栈/兼容性）
       - 成功标准是什么？
    通过 AskUserQuestion 与用户互动。最多 3 轮提问。
    每轮聚焦一个关键问题。
    完成后，总结你收集到的上下文，不要写任何文件。
  params:
    - discussion_topic: ${讨论主题}
    - project_root
    - knowledge_dir: docs/knowledge/

### Step 3: 架构师分析 + 多轮讨论

加载 `agents/dev-architect.md`，以技术顾问模式 spawn：

- agent: dev-architect
  model: opus
  task: |
    技术顾问模式（不要写 ARCHITECTURE.md）。
    基于讨论主题和上下文：
    1. 分析 2-3 个可行方案（包括利弊）
    2. 给出你的推荐（及原因）
    3. 指出每个方案的风险和代价
    通过 AskUserQuestion 与用户讨论。最多 3 轮。
    每轮针对一个方案深入讨论，回答用户的疑问。
    口头分析和讨论。完成后，输出讨论结论。
  params:
    - discussion_topic: ${讨论主题}
    - project_root
    - knowledge_dir: docs/knowledge/
    - product_context: ${产品经理收集的上下文}

**讨论格式**：架构师通过 AskUserQuestion 展示方案，用户选择或追问，反复直到满意。

### Step 4: 生成会议纪要

编排器（主会话）基于产品经理和架构师的分析，生成 MINUTES.md：

```markdown
# 会议纪要: <讨论主题>

## 日期
YYYY-MM-DD

## 参与者
- 用户（决策者）
- 产品经理（主持人）
- 架构师（技术顾问）

## 背景
<为什么需要这次讨论>

## 讨论要点

### 要点 1: <主题>
- **问题**: <讨论了什么>
- **分析**: <架构师的技术评估>
- **决策**: <最终决定>

### 要点 2: ...

## 决策汇总

| # | 决策 | 原因 | 行动 |
|---|------|------|------|
| 1 | <决策> | <为什么> | <下一步> |

## 行动项

- [ ] <行动 1> → `dev-flow feat <描述>`
- [ ] <行动 2> → `dev-flow refactor <描述>`
```

写入 `.dev/discuss/MINUTES.md`。

### Step 5: Recorder

如果讨论中有值得记录的架构决策，加载 `agents/dev-recorder.md`：

- agent: dev-recorder
  model: sonnet
  task: 记录讨论中的关键决策和原因。
  params:
    - knowledge_dir: docs/knowledge/
    - phase: discussion
    - notes: ${讨论中的关键决策和原因，如为什么选A不选B}

### 完成提示

```
================================================================
 DISCUSSION COMPLETE
================================================================
 主题: <讨论主题>
 决策: <N> 项
 纪要: .dev/discuss/MINUTES.md

 行动项:
   dev-flow feat <功能描述>
   dev-flow refactor <重构描述>
================================================================
```

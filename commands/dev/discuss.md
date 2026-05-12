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

# /dev:discuss — 架构讨论模式（只读）

开个会。产品经理主持，架构师做技术顾问，你做决策。不修改任何代码。

## 适用场景

- 不确定怎么实现，想讨论方案
- 技术选型犹豫，需要分析利弊
- 架构方向有争议，需要多方视角
- 想在写代码前对齐思路

## 不适用

- 已经知道怎么做，直接做（用 `/dev:feat` 或 `/dev:fix`）
- 想审查代码质量（用 `/dev:review`）
- 想排查 bug（用 `/dev:investigate`）

## 流程

```
/dev:discuss 用户权限系统怎么设计
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

以内联方式 spawn dev-product，做讨论前的准备：

```
Agent(
  subagent_type="dev-product",
  model="opus",
  prompt="
    <discussion_topic><讨论主题></discussion_topic>
    <project_root><项目根目录绝对路径></project_root>
    <knowledge_dir>docs/knowledge/</knowledge_dir>

    你是讨论主持人。不要写 PRD，不要写文件。

    1. 阅读项目结构和相关代码，理解当前状态
    2. 阅读知识库，了解已有约束和约定
    3. 向用户提问，澄清讨论的核心问题：
       - 你最关心什么？（性能/安全/可维护性/开发速度）
       - 有什么约束？（时间/技术栈/兼容性）
       - 成功标准是什么？

    通过 AskUserQuestion 与用户互动。最多 3 轮提问。
    每轮聚焦一个关键问题。

    完成后，总结你收集到的上下文，不要写任何文件。
  "
)
```

### Step 3: 架构师分析 + 多轮讨论

基于产品经理收集的上下文，spawn 架构师进行分析，然后与用户多轮讨论：

```
Agent(
  subagent_type="dev-architect",
  model="opus",
  prompt="
    <discussion_topic><讨论主题></discussion_topic>
    <project_root><项目根目录绝对路径></project_root>
    <knowledge_dir>docs/knowledge/</knowledge_dir>
    <product_context>
    <产品经理收集的上下文>
    </product_context>

    你是技术顾问。基于讨论主题和上下文：

    1. 分析 2-3 个可行方案（包括利弊）
    2. 给出你的推荐（及原因）
    3. 指出每个方案的风险和代价

    通过 AskUserQuestion 与用户讨论。最多 3 轮。
    每轮针对一个方案深入讨论，回答用户的疑问。

    不要写 ARCHITECTURE.md。口头分析和讨论。
    完成后，输出讨论结论。
  "
)
```

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

- [ ] <行动 1> → `/dev:feat <描述>`
- [ ] <行动 2> → `/dev:refactor <描述>`
```

写入 `.dev/discuss/MINUTES.md`。

### Step 5: Recorder

如果讨论中有值得记录的架构决策：

```
Agent(
  subagent_type="dev-recorder",
  model="sonnet",
  prompt="
    <knowledge_dir>docs/knowledge/</knowledge_dir>
    <phase>discussion</phase>
    <notes>
    <讨论中的关键决策和原因，如为什么选A不选B>
    </notes>
  "
)
```

### 完成提示

```
================================================================
 DISCUSSION COMPLETE
================================================================
 主题: <讨论主题>
 决策: <N> 项
 纪要: .dev/discuss/MINUTES.md

 行动项:
   /dev:feat <功能描述>
   /dev:refactor <重构描述>
================================================================
```

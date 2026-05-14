---
name: dev_investigate
description: Bug 排查模式（只读），架构师探索代码定位根因，不修改任何文件
argument-hint: "<问题描述>"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Agent
---

# /dev:investigate — Bug 排查模式（只读）

探索问题，定位根因，不修改任何代码。产出调查报告，为后续 `/dev:fix` 提供依据。

## 适用场景

- 报了 bug 但不知道原因
- 需要理解某个问题的根因
- 想先调查再决定怎么修

## 不适用

- 已经知道原因，直接修（用 `/dev:fix`）
- 线上紧急故障（用 `/dev:hotfix`）
- 需要修改代码（用 `/dev:fix` 或 `/dev:patch`）

## 流程

```
/dev:investigate 用户登录后偶尔被踢出
    ↓
Step 1: 解析问题描述
    ↓
Step 2: 架构师探索代码，追踪执行路径
    ↓
Step 3: 生成 INVESTIGATION.md
    ↓
Step 4: Recorder（记录排查发现）
    ↓
Done. 建议 /dev:fix 或 /dev:feat
```

## 执行步骤

### Step 1: 解析输入

提取问题描述。investigate 模式不使用 git、不创建分支、不写 `.dev/` 目录。

### Step 2: 架构师排查

以内联方式 spawn dev-architect，只做调查：

```
Agent(
  subagent_type="dev-architect",
  model="opus",
  prompt="
    <investigation_request><问题描述></investigation_request>
    <project_root><项目根目录绝对路径></project_root>
    <knowledge_dir>docs/knowledge/</knowledge_dir>

    你正在调查一个 bug。你的任务是：

    1. **理解症状**: 根据描述，确定问题表现是什么
    2. **追踪路径**: 阅读相关代码，追踪可能的执行路径
    3. **定位原因**: 找到最可能的根因（包括代码位置）
    4. **评估影响**: 这个 bug 影响哪些功能/用户

    输出格式（写入 .dev/investigation/INVESTIGATION.md）：

    # 调查报告: <问题描述>

    ## 症状
    <具体表现>

    ## 调查过程
    <追踪了哪些代码路径，排除了哪些可能性>

    ## 根因分析
    <最可能的根因，包含文件路径和行号>

    ## 影响范围
    <受影响的功能/场景>

    ## 置信度
    <高/中/低>

    ## 建议下一步
    - 如果是 bug: /dev:fix <修复建议>
    - 如果是设计问题: /dev:refactor <重构建议>
    - 如果需要新功能: /dev:feat <功能建议>

    注意：不要修改任何源代码文件。只读分析。
  "
)
```

### Step 3: 确认调查报告

读取生成的 INVESTIGATION.md，向用户展示关键发现：

```
调查完成。

根因: <根因摘要>（置信度: 高/中/低）
位置: <文件路径:行号>

建议: /dev:fix <修复建议>
```

### Step 4: Recorder

如果调查发现了值得记录的知识：

```
Agent(
  subagent_type="dev-recorder",
  model="sonnet",
  prompt="
    <knowledge_dir>docs/knowledge/</knowledge_dir>
    <phase>investigation</phase>
    <notes>
    <调查中的关键发现，如非显而易见的代码行为、隐藏的依赖关系等>
    </notes>
  "
)
```

## 与其他模式的关系

| 发现 | 建议下一步 |
|------|-----------|
| 确认是 bug | `/dev:fix <问题描述>` |
| 是设计缺陷 | `/dev:refactor <重构建议>` |
| 需要新功能支持 | `/dev:feat <功能描述>` |
| 原因不明 | 继续调查或 `/dev:discuss` 讨论 |

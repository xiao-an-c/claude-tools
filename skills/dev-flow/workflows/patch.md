---
name: patch
display_name: "超轻量补丁"
description: "零文档、零 git、零团队。架构师快速分析方案，开发者直接实现。适用于 1-2 文件的小改动。"
category: code-change
argument_hint: "<改动描述>"
defaults:
  use_git: false
  config_depth: none
  branch_type: null
  base_branch: null
---

# Workflow: 超轻量补丁

## 适用场景

- 改个配置、修个 typo、调个样式
- 小 bug fix，原因明确
- 已知怎么改，只需要执行

## 不适用

- 涉及 3+ 文件的改动（用 fix）
- 需要新分支、PR（用 feat）
- 需要测试设计（用 feat）

## 预期耗时

2-3 分钟（2 次 Agent spawn）

## 状态管理

不创建 `.dev/` 目录，不写 config.yml，不生成任何文档。

## 步骤

### Step 1: 架构师快速分析 + 方案

Type: agent
Agent: dev-architect
Model: opus
Spawn: inline

```
<change_request>${description}</change_request>
<project_root>${project_root}</project_root>

快速分析这个改动，返回结构化的实施方案（不要写任何文件）：

## 实施方案

### T-01: <任务标题>
- **描述**: <具体做什么>
- **文件**: <需要修改的文件路径>
- **改动**: <每个文件具体改什么，2-3 句话>

### T-02: ...（如需要）

## 风险点
<是否有副作用或需要注意的地方>

如果改动描述不够明确，指出需要向用户澄清的问题。
如果改动涉及交互变更，标注 `[UI]` 并说明交互细节。
不要输出 ARCHITECTURE.md，不要写任何文件。
```

**如果改动涉及交互变更（包含 `[UI]` 标注），需要向用户确认交互细节：**

用 AskUserQuestion 确认交互需求，确保方案覆盖所有交互场景。

### Step 2: 开发者实现

Type: agent
Agent: dev-developer
Model: sonnet
Spawn: inline

```
<project_root>${project_root}</project_root>

按以下方案实现改动（不需要创建文档文件）：

<plan>
${step_1_result}
</plan>

<user_adjustments>
${user_adjustments}
</user_adjustments>

要求：
- 直接修改文件，不需要创建任何设计文档
- 实现完成后提交代码（commit message 用简洁的中文描述改动）
```

### Step 3: 验证

Type: builtin
Action: verify
Probing: true
Retry: 0

检查项目是否有验证命令（package.json scripts、Makefile 等），如果有则运行。没有则跳过。

### Step 4: 结果

Type: builtin
Action: display_summary

```
✓ 补丁完成
  改动: ${changed_files}
  提交: ${commit_hash}
```

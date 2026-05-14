---
name: auto
display_name: "即兴编排"
description: "无匹配工作流时，由 workflow-architect 动态设计团队流程。执行后可沉淀为可复用模板。"
category: code-change
argument_hint: "[--git|--no-git] <任务描述>"
defaults:
  use_git: true
  base_branch: develop
  branch_type: feat
  config_depth: full
---

# Workflow: 即兴编排

## 适用场景

- 任务不匹配任何预设工作流
- 跨类型复合任务（迁移同时涉及重构+新功能+测试）
- 不确定该怎么做的探索性工作

## 流程

```
auto <任务描述>
    ↓
Step 1: 解析参数
    ↓
Step 2: workflow-architect 设计工作流
    ↓
Step 3: 用户确认工作流设计
    ↓
Step 4: 按工作流逐步执行
    ↓
Step 5: 提议沉淀（保存为模板）
    ↓
Done.
```

## 步骤

### Step 1: 解析参数

Type: builtin
Action: parse_arguments
Flags: [--git, --no-git]
Fallback: AskUserQuestion if no description

分支类型根据任务描述判断，无法判断时默认 feat/*。

### Step 2: 工作流架构师设计工作流

Type: agent
Agent: dev-workflow-architect
Model: opus
Spawn: inline

```
<task_description>${description}</task_description>
<project_root>${project_root}</project_root>
<workflow_path>.dev/plan/${branch_name}/WORKFLOW.md</workflow_path>
<knowledge_dir>docs/knowledge/</knowledge_dir>
```

### Step 3: 用户确认工作流

Type: builtin
Action: human_confirmation
Gate: workflow_design
Options: [按设计执行, 简化流程, 取消]
Show: 复杂度评估、步骤摘要、涉及 agent

- **按设计执行** → Step 4
- **简化流程** → 用户说明跳过哪些步骤，然后 Step 4
- **取消** → 结束

### Step 4: 按工作流执行

Type: builtin
Action: execute_workflow

读取 WORKFLOW.md 中的步骤表，按设计执行每个步骤：

1. 根据 Agent 列选择 agent type
2. 构建包含前序步骤产出的 prompt
3. 无阻塞步骤可并行 spawn，有阻塞步骤等前置完成
4. 人类介入点用 AskUserQuestion 确认
5. 每步完成后更新 TASK-LOG.md

spawn 模板：

```
Agent(
  subagent_type="<agent-type>",
  model="<model>",
  prompt="
    <project_root>${project_root}</project_root>
    <knowledge_dir>docs/knowledge/</knowledge_dir>
    <config_path>.dev/config.yml</config_path>

    任务: <步骤描述>

    <context>
    <前序步骤的关键产出或文件路径>
    </context>

    <output>
    <这一步应该产出什么>
    </output>
  "
)
```

最后触发 recorder（一次）：

```
Agent(
  subagent_type="dev-recorder",
  model="sonnet",
  prompt="
    <knowledge_dir>docs/knowledge/</knowledge_dir>
    <phase>development</phase>
    <task_title>${description}</task_title>
    <branch_name>${branch_name}</branch_name>
    <changed_files>
    <所有变更文件>
    </changed_files>
    <commit_hash><最新 commit></commit_hash>
    <notes>
    <任务中的关键发现和经验>
    </notes>
  "
)
```

### Step 5: 提议沉淀

Type: builtin
Action: propose_precipitation

如果工作流是动态设计的（不是从 .dev/workflows/ 读取的）且执行成功：

```
AskUserQuestion(questions=[{
  header: "沉淀工作流",
  multi_select: false,
  options: [
    { label: "保存为模板", description: "保存到 .dev/workflows/ 供以后复用" },
    { label: "跳过", description: "不保存" }
  ],
  question: "本次工作流执行完成。要保存为可复用的模板吗？"
}])
```

- 保存 → 询问模板名称 → 将 WORKFLOW.md 转为工作流定义格式 → 写入 `.dev/workflows/<name>.md`
- 跳过 → 继续

### Step 6: 验收

Type: builtin
Action: generate_acceptance

生成 `.dev/plan/${branch_name}/ACCEPTANCE.md`，显示最终摘要。

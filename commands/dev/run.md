---
name: dev_run
description: 通用工作流执行器，读取 .dev/workflows/ 中的工作流定义并机械执行
argument-hint: "<workflow-name> [--git|--no-git] <描述>"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Agent
  - AskUserQuestion
---

# /dev:run — 通用工作流执行器

你是一个工作流执行器。你读取工作流定义文件，然后机械执行每一步。

## 绝对禁止

你是执行器，不是分析师。**禁止：**

- 读取业务源代码文件（只读状态文件和工作流定义）
- 做技术判断（架构决策、代码分析全部交给 agent）
- 自己写代码或修改源码
- 自己跑测试（委托给 agent 或 builtin action）

**允许：**

- 读取工作流定义文件（`.dev/workflows/*.md`）
- 读取状态文件（`.dev/config.yml`、TASK-LOG.md、PRD.md 等）
- 运行 git 命令（分支、状态、日志）
- 通过 `Agent()` spawn agent
- 写状态文件（TASK-LOG.md、ACCEPTANCE.md、config.yml）
- 运行验证命令（从 config 读取）

## 运行时变量

执行前解析以下变量：

| 变量 | 来源 | 示例 |
|------|------|------|
| `${project_root}` | 项目根目录绝对路径 | `/Users/x/project` |
| `${description}` | 用户输入的任务描述 | "修复登录按钮样式" |
| `${slug}` | 从描述生成的 URL-safe slug | `fix-login-button` |
| `${branch_type}` | 工作流 defaults.branch_type | `feat` |
| `${base_branch}` | 工作流 defaults.base_branch | `develop` |
| `${branch_name}` | `${branch_type}/${slug}` | `feat/fix-login-button` |
| `${use_git}` | --git/--no-git 标志 | `true` |
| `${config_depth}` | 工作流 defaults.config_depth | `full` |

**循环内额外变量：**

| 变量 | 来源 |
|------|------|
| `${task.id}` | PLAN.md 中的任务 ID |
| `${task.title}` | 当前任务标题 |
| `${task.description}` | 当前任务描述 |
| `${task.files}` | 当前任务文件列表 |
| `${task.changed_files}` | developer 修改的文件 |
| `${task.commit_hash}` | developer 的 commit hash |

**步骤间变量：**

| 变量 | 来源 |
|------|------|
| `${step_N_result}` | 第 N 步 agent 的返回结果 |
| `${user_adjustments}` | 用户在确认时提供的调整说明 |
| `${complexity}` | 复杂度评估结果 |

## 执行流程

### 0. 加载工作流

1. 读取 `.dev/workflows/${workflow_name}.md`
2. 解析 YAML frontmatter 获取 defaults
3. 提取所有步骤定义
4. 初始化运行时变量

### 1. 解析参数 (parse_arguments)

```
1. 扫描参数中的 --git / --no-git 标志
2. 第一个非标志参数是工作流名称（已由调用者传入）
3. 剩余文本是任务描述
4. 如果没有描述，用 AskUserQuestion 询问
5. 从描述生成 slug（关键词 + 连字符）
```

### 2. 创建分支 (git_create_branch)

**仅在 `use_git == true` 且 `branch_type != null` 时执行。**

```bash
BASE_BRANCH="${base_branch}"

STASH_NEEDED=false
if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
  STASH_NEEDED=true
  git stash push -m "dev-workflow-auto-stash" --include-untracked
fi

git checkout "$BASE_BRANCH" 2>/dev/null || git checkout main 2>/dev/null || git checkout master
git pull origin "$BASE_BRANCH" 2>/dev/null || true
git checkout -b ${branch_type}/${slug}

if [ "$STASH_NEEDED" = true ]; then
  git stash pop 2>/dev/null || true
fi
```

### 3. 初始化状态 (init_state)

**仅在 `config_depth != none` 时执行。**

```bash
mkdir -p .dev/plan/${branch_name}
```

写入 `.dev/config.yml`，schema 深度根据 `config_depth`：

| config_depth | 写入的段 |
|-------------|---------|
| `none` | 不写 config.yml |
| `minimal` | git, workflow |
| `full` | git, workflow, sub_branches, project, source_layout, build, test, verification, conventions |

创建 `TASK-LOG.md` 初始空表。

### 4. 执行工作流步骤

**按顺序读取工作流定义中的每个步骤：**

#### 对每个步骤

1. **检查 Condition** — 如果步骤有条件且不满足，跳过
2. **根据 Type 执行：**

**Type: agent**

- 解析 prompt 模板中的 `${variable}`，替换为运行时值
- spawn agent：

  ```
  Agent(
    subagent_type="<Agent>",
    model="<Model>",
    prompt="<解析后的 prompt>"
  )
  ```

- 如果步骤有 `parallel_with`，同时 spawn 多个 agent
- 等待 agent 返回
- 收集返回值到 `${step_N_result}`
- 如果有 `On_complete`，执行后续动作

**Type: builtin**

- 执行对应的内置动作（见下方"内置动作"节）

**Type: loop**

- 读取循环源（如 PLAN.md 中的任务列表）
- 对每个循环项执行子步骤
- 支持并行（`max_parallel`）和子分支
- 上下文超过 60% 时建议 `/dev:resume`

**Type: condition**

- 评估条件表达式
- 满足则执行，不满足则跳过

1. **人类门控** — 如果步骤标记了 `Human_gate: true` 或有 `Action: human_confirmation`：
   - 用 AskUserQuestion 展示信息，提供选项
   - 根据用户选择继续/调整/取消

### 5. 验证 (verify)

在工作流最后执行（或工作流指定的时机）：

1. 从 `.dev/config.yml` 读取 `verification.commands`
2. 如果为空且 `Probing: true`，探测项目的 build/lint/test 命令
3. 执行每个命令
4. 失败时：spawn `retry_agent`（通常是 dev-developer）修复，最多重试 `Retry` 次
5. 记录结果到 TASK-LOG.md

### 6. 验收 (generate_acceptance)

**仅在 `config_depth != none` 时执行。**

1. 读取 TASK-LOG.md
2. 如果 use_git：`git log ${base_branch}..HEAD --oneline`
3. 写入 ACCEPTANCE.md：

```markdown
# 验收说明书 — ${workflow_name}

## 任务
${description}

## 工作流步骤
<从 TASK-LOG 读取>

## 变更
<git log>

## 验证
<验证结果>
```

### 7. 总结 (display_summary)

读取工作流中定义的 summary 格式，替换变量，输出。

## 内置动作参考

### human_confirmation

```
AskUserQuestion(questions=[{
  header: "<gate_name>",
  multi_select: false,
  options: [
    { label: "执行", description: "按方案执行" },
    { label: "调整", description: "修改方案细节" },
    { label: "取消", description: "不做了" }
  ],
  question: "<展示内容>。确认？"
}])
```

- 执行 → 继续
- 调整 → 记录到 `${user_adjustments}`，继续
- 取消 → 结束

### evaluate_complexity

1. 读取 PRD.md
2. 计算用户故事数、预估文件变更数、是否有新模块
3. 应用工作流中的 Rules
4. 写入 `config.yml` 的 `workflow.complexity`
5. 如果 `use_git==true AND complexity==complex`，启用 sub_branches

### verify

见上方"步骤 5: 验证"。

### display_summary

按工作流定义的 summary 格式输出，替换所有变量。

## 工作流沉淀

执行完 auto 模式（动态设计的工作流）后，检查是否应该提议保存：

1. 如果工作流是动态设计的（不是从 `.dev/workflows/` 读取的）
2. 且执行成功（所有步骤完成）
3. 则询问用户：

```
AskUserQuestion(questions=[{
  header: "沉淀工作流",
  multi_select: false,
  options: [
    { label: "保存为模板", description: "将此工作流保存到 .dev/workflows/ 供以后复用" },
    { label: "跳过", description: "不保存" }
  ],
  question: "本次工作流执行完成。要保存为可复用的模板吗？"
}])
```

- 保存 → 询问模板名称 → 将 WORKFLOW.md 转为 workflow 定义格式 → 写入 `.dev/workflows/<name>.md`
- 跳过 → 结束

## 错误处理

- **Agent spawn 失败**：重试 1 次，仍然失败则报告用户
- **验证失败**：按工作流的 Retry 配置重试，耗尽后记录 FAILED
- **上下文 > 60%**：输出进度摘要，建议 `/dev:resume`

---
name: hotfix
display_name: "紧急修复"
description: "最小流程最大速度。从 main 创建 hotfix 分支，快速修复线上问题。"
category: code-change
argument_hint: "[--git|--no-git] <问题描述>"
defaults:
  use_git: true
  base_branch: main
  branch_type: hotfix
  config_depth: minimal
---

# Workflow: 紧急修复

## 适用场景

- 生产环境故障，需要立即修复
- 线上 bug 导致用户受影响
- 需要绕过正常流程的紧急情况

## 不适用

- 非紧急的常规 bug（用 fix）
- 需要详细诊断和测试设计（用 fix 或 investigate）
- 大规模重构（用 refactor）

## 预期耗时

3-5 分钟（2 次 Agent spawn + 最小验证）

## 状态管理

创建 `.dev/plan/hotfix-<slug>/` 目录，写入 TASK-LOG.md、ACCEPTANCE.md。最小化配置。

## 步骤

### Step 1: 解析参数 + 创建分支

Type: builtin
Action: parse_and_branch

```
1. 从输入中提取 --git / --no-git 标志
2. 设置 use_git 变量：
   - --no-git -> use_git = false
   - --git 或无标志 -> use_git = true（hotfix 默认使用 git）
3. 从剩余文本中提取问题描述
4. 生成 slug（取关键词，短横线连接）
```

**创建分支（use_git=true 时）：**

```bash
# 检测 main vs master
BASE_BRANCH=$(git rev-parse --verify main >/dev/null 2>&1 && echo "main" || echo "master")

STASH_NEEDED=false
if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
  STASH_NEEDED=true
  git stash push -m "dev-hotfix-auto-stash" --include-untracked
fi

git checkout "$BASE_BRANCH"
git pull origin "$BASE_BRANCH" 2>/dev/null || true
git checkout -b hotfix/$SLUG

if [ "$STASH_NEEDED" = true ]; then
  git stash pop 2>/dev/null || true
fi
```

### Step 2: 初始化状态

Type: builtin
Action: init_state

```bash
mkdir -p .dev/plan/hotfix-$SLUG
```

**写入 `.dev/config.yml`：**

```yaml
git:
  base_branch: ${base_branch}
  current_branch: hotfix/${slug}
  slug: ${slug}
  branch_type: hotfix

workflow:
  mode: hotfix
```

**创建 `.dev/plan/hotfix-$SLUG/TASK-LOG.md`。**

### Step 3: 架构师快速诊断

Type: agent
Agent: dev-architect
Model: opus
Spawn: inline
No files: true

```
<change_request>${bug_description}</change_request>
<project_root>${project_root}</project_root>

这是紧急线上修复。快速分析问题，返回以下信息（不要写任何文件）：

1. **影响范围**: 哪些功能/用户受影响
2. **可能原因**: 1-3 个最可能的根因
3. **修复方案**: 每个原因对应的修复方式（每个 1-2 句话）
4. **风险评估**: 修复可能引入的新问题

不要输出 ARCHITECTURE.md，不要做详细设计。速度优先。
```

### Step 4: 开发者实现

Type: agent
Agent: dev-developer
Model: sonnet
Spawn: inline

```
<project_root>${project_root}</project_root>
<knowledge_dir>docs/knowledge/</knowledge_dir>

紧急修复。直接实现以下改动：

<hotfix_plan>
${architect_result}
</hotfix_plan>

<user_adjustments>
${user_adjustments}
</user_adjustments>

要求：
- 最小化改动，只修复问题，不做额外重构
- 实现完成后提交代码（commit message: fix(scope): [紧急] <修复描述>）
```

### Step 5: 最小验证

Type: builtin
Action: verify
Probing: true
Retry: 0

```bash
# 只运行 build 和现有测试，不生成新测试
# 从 .dev/config.yml 读取 build.command 和 test.unit_command
# 如果没有配置，跳过
```

### Step 6: Recorder

Type: agent
Agent: dev-recorder
Model: sonnet
Spawn: inline

**收集变更信息：**

```bash
CHANGED_FILES=$(git diff --name-only $BASE_BRANCH..HEAD 2>/dev/null || git diff --name-only HEAD~1..HEAD)
COMMIT_HASH=$(git log --oneline -1 --format="%h")
```

```
<knowledge_dir>docs/knowledge/</knowledge_dir>
<phase>development</phase>
<task_title>紧急修复: ${bug_description}</task_title>
<branch_name>hotfix/${slug}</branch_name>
<changed_files>
${changed_files}
</changed_files>
<commit_hash>${commit_hash}</commit_hash>
<notes>
线上问题原因: ${root_cause}
修复方式: ${fix_method}
</notes>
```

### Step 7: 验收 + 摘要

Type: builtin
Action: generate_acceptance_and_summary

**生成 `.dev/plan/hotfix-<slug>/ACCEPTANCE.md`：**

```markdown
# 验收说明书 -- 紧急修复

## 问题
${bug_description}

## 根因
${root_cause}

## 修复
${fix_content}

## 验证
- Build: ${build_result}
- Tests: ${test_result}

## 合并策略
hotfix 分支需合并到 main + develop，并打 tag。
请运行 /git:finish 完成合并。
```

**显示最终摘要：**

```
================================================================
 HOTFIX COMPLETE
================================================================
 问题: ${bug_description}
 分支: hotfix/${slug}
 修复: ${fix_summary}
 验证: ${verification_result}

 ⚠️  下一步:
   /git:finish   — 合并到 main + develop，打 tag
================================================================
```

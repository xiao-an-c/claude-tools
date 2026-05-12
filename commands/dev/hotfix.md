---
name: dev_hotfix
description: 紧急修复模式，从 main 创建 hotfix 分支，最小流程快速修复线上问题
argument-hint: "[--git|--no-git] <问题描述>"
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

# /dev:hotfix — 紧急修复模式

线上出事了。最小流程，最大速度。架构师快速诊断，开发者立即修复。

## 绝对禁止

- ❌ 读取与分析无关的源代码
- ❌ 做多余的技术判断
- ❌ 生成不必要的文档

## 适用场景

- 生产环境故障，需要立即修复
- 线上 bug 导致用户受影响
- 需要绕过正常流程的紧急情况

## 参数

| 参数 | 说明 |
|------|------|
| `--git` | 强制使用 git（默认即使用） |
| `--no-git` | 跳过 git，在当前分支工作（不推荐） |

## 流程

```
/dev:hotfix 线上登录接口返回500
    ↓
Step 1: 解析参数 + 创建 hotfix/* 分支（从 main/master）
    ↓
Step 2: 初始化状态
    ↓
Step 3: 架构师快速诊断（口头，不写文件）
    ↓
Step 4: 确认修复方案
    ↓
Step 5: 开发者实现修复
    ↓
Step 6: 最小验证（build + 现有测试）
    ↓
Step 7: Recorder（记录紧急修复原因和方案）
    ↓
Step 8: 验收 + 提示 /git:finish
```

## 执行步骤

### Step 1: 解析参数 + 创建分支

```markdown
1. 从输入中提取 `--git` / `--no-git` 标志
2. 设置 `use_git` 变量：
   - `--no-git` → use_git = false
   - `--git` 或无标志 → use_git = true（hotfix 默认使用 git）
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
git checkout -b hotfix/<slug>

if [ "$STASH_NEEDED" = true ]; then
  git stash pop 2>/dev/null || true
fi
```

### Step 2: 初始化状态

```bash
mkdir -p .dev/plan/hotfix-<slug>
```

**写入 `.dev/config.yml`：**

```yaml
git:
  base_branch: main  # or master
  current_branch: hotfix/<slug>
  slug: <slug>
  branch_type: hotfix

workflow:
  mode: hotfix
```

**创建 `.dev/plan/hotfix-<slug>/TASK-LOG.md`。**

### Step 3: 架构师快速诊断

**不写文件，口头返回方案。** 以内联方式 spawn dev-architect：

```
Agent(
  subagent_type="dev-architect",
  model="opus",
  prompt="
    <change_request><问题描述></change_request>
    <project_root><项目根目录绝对路径></project_root>

    这是紧急线上修复。快速分析问题，返回以下信息（不要写任何文件）：

    1. **影响范围**: 哪些功能/用户受影响
    2. **可能原因**: 1-3 个最可能的根因
    3. **修复方案**: 每个原因对应的修复方式（每个 1-2 句话）
    4. **风险评估**: 修复可能引入的新问题

    不要输出 ARCHITECTURE.md，不要做详细设计。速度优先。
  "
)
```

### Step 4: 确认修复方案

```
AskUserQuestion(questions=[{
  header: "紧急修复",
  multi_select: false,
  options: [
    { label: "立即执行", description: "按建议的方案修复" },
    { label: "调整方案", description: "我想修改修复方式" },
    { label: "先调查", description: "信息不足，切换到 investigate 模式" }
  ],
  question: "架构师建议：<方案摘要>。确认？"
}])
```

- **立即执行** → Step 5
- **调整方案** → 用户补充后进入 Step 5
- **先调查** → 建议用户使用 `/dev:investigate`

### Step 5: 开发者实现

```
Agent(
  subagent_type="dev-developer",
  model="sonnet",
  prompt="
    <project_root><项目根目录绝对路径></project_root>
    <knowledge_dir>docs/knowledge/</knowledge_dir>

    紧急修复。直接实现以下改动：

    <hotfix_plan>
    <架构师返回的方案>
    </hotfix_plan>

    <user_adjustments>
    <用户调整内容，如无则为空>
    </user_adjustments>

    要求：
    - 最小化改动，只修复问题，不做额外重构
    - 实现完成后提交代码（commit message: fix(scope): [紧急] <修复描述>）
  "
)
```

### Step 6: 最小验证

```bash
# 只运行 build 和现有测试，不生成新测试
# 从 .dev/config.yml 读取 build.command 和 test.unit_command
# 如果没有配置，跳过
```

### Step 7: Recorder

收集变更信息后 inline spawn recorder：

```
Agent(
  subagent_type="dev-recorder",
  model="sonnet",
  prompt="
    <knowledge_dir>docs/knowledge/</knowledge_dir>
    <phase>development</phase>
    <task_title>紧急修复: <问题描述></task_title>
    <branch_name>hotfix/<slug></branch_name>
    <changed_files>
    <从 git diff 获取的文件列表>
    </changed_files>
    <commit_hash><最新 commit hash></commit_hash>
    <notes>
    线上问题原因: <根因>
    修复方式: <修复方式>
    </notes>
  "
)
```

### Step 8: 验收 + 提示

**生成 `.dev/plan/hotfix-<slug>/ACCEPTANCE.md`：**

```markdown
# 验收说明书 — 紧急修复

## 问题
<问题描述>

## 根因
<根因分析>

## 修复
<修复内容>

## 验证
- Build: <通过/失败/跳过>
- Tests: <通过/失败/跳过>

## 合并策略
hotfix 分支需合并到 main + develop，并打 tag。
请运行 /git:finish 完成合并。
```

**显示最终摘要：**

```
================================================================
 HOTFIX COMPLETE
================================================================
 问题: <问题描述>
 分支: hotfix/<slug>
 修复: <修复摘要>
 验证: <结果>

 ⚠️  下一步:
   /git:finish   — 合并到 main + develop，打 tag
================================================================
```

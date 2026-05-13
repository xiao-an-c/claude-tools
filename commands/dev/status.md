---
name: dev:status
description: 查看当前开发工作流状态和进度
allowed-tools: [Read, Bash, Glob]
---

# /dev:status — 查看工作流状态

## 执行流程

### 1. 获取当前分支

```bash
CURRENT_BRANCH=$(git branch --show-current)
```

如果不是 `feat/*`、`fix/*`、`refactor/*`、`hotfix/*`、`release/*` 分支（包括子分支 `<type>/<slug>-t*`），提示 "当前分支没有活跃的开发工作流"。

### 2. 检查状态目录

检查 `.dev/plan/<current-branch>/` 是否存在。如果在子分支上，也检查 `.dev/plan/<parent-branch>/`。

如果不存在，提示 "未找到工作流状态文件。使用 /dev:start 启动工作流。"

### 3. 读取并展示状态

读取 `.dev/config.yml` 获取：
- `workflow.mode` — 工作流模式 (fix/feat/refactor/hotfix/patch; patch 通常不产生持久化状态)
- `git.base_branch` — 基础分支
- `git.branch_type` — 分支类型
- `sub_branches.enabled` — 是否启用子分支
- `sub_branches.active` — 当前活跃子分支
- `sub_branches.completed` — 已合并子分支列表
- `sub_branches.failed` — 失败子分支列表

**读取工作流定义（如果存在）：**

优先读取 `.dev/workflows/${workflow.mode}.md`，不存在则用包内置的 `workflows/${workflow.mode}.md`。

从工作流定义中提取：
- `display_name` — 工作流显示名称
- 步骤总数和名称列表

**读取产出文件并计算进度：**

遍历工作流定义中的步骤，检查每个步骤的产出文件是否存在，计算完成百分比。

读取以下文件并展示：

**PLAN.md** — 展示任务总数和列表（patch/hotfix 模式可能不存在）

**TASK-LOG.md** — 展示执行记录表格

**ACCEPTANCE.md** — 如果存在，标记为已完成

**子分支状态** — 扫描本地分支中匹配 `<type>/<slug>-t*` 的分支，检查合并状态：
```bash
git branch --list "<type>/<slug>-t*"
# 对每个子分支: git branch --merged 检查是否已合并
```

### 4. 展示格式

```
================================================================
 DEV WORKFLOW STATUS
================================================================
 分支: <branch> (<branch_type>)
 工作流: <display_name> (<mode>)
 状态: <进行中/已完成>

 步骤进度: X/Y 完成
 ┃████████░░░░░░░░░░░░░░░░░░░░░░░ 40%
 ├─ Step 1: 参数解析 ✓
 ├─ Step 2: 创建分支 ✓
 ├─ Step 3: 初始化状态 ✓
 ├─ Step 4: 架构师诊断 ✓
 ├─ Step 5: 用户确认 ✓
 ├─ Step 6: 开发执行 ◉ (当前)
 ├─ Step 7: 验证
 └─ Step 8: 验收

 知识库: <N> 条记录

 子分支:
  [merged]   feat/user-auth-t01 — Login page
  [active]   feat/user-auth-t02 — Auth service (current)
  [pending]  feat/user-auth-t03 — Session mgmt

 提交数: N
================================================================

 任务详情 (from TASK-LOG.md):
 | T-01 | 功能标题     | 完成 | abc1234 |
 | T-02 | 功能标题     | 完成 | def5678 |
 | T-03 | 功能标题     | 待执行 | -      |

 下一步:
   /dev:resume  — 继续执行未完成的步骤
   /git:status  — 查看 git 分支状态
   /git:finish  — 合并到 <base_branch>
```

### 5. 已沉淀工作流（如果执行了 /dev:list 或用户询问）

扫描 `.dev/workflows/` 目录，列出所有可用工作流：
```bash
ls .dev/workflows/*.md
```

展示格式：
```
可用工作流:
  patch     — 极小改动 (4 步)
  fix       — Bug 修复 (8 步)
  feat      — 新功能开发 (13 步)
  refactor  — 代码重构 (12 步)
  hotfix    — 紧急修复 (8 步)
  <custom>  — 用户自定义
```

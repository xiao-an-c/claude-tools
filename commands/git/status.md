---
name: git:status
description: 查看分支状态和下一步建议（支持子分支和父分支显示）
allowed-tools: [Bash]
---

# /git:status — 查看分支状态

查看当前分支状态和下一步建议。支持子分支和父分支显示。

## 用法

```bash
/git:status
```

## 子分支检测

解析当前分支名，检测是否匹配子分支模式：`^(feat|fix|refactor|hotfix|release)/(.+)-t\d+$`

## 分支类型识别

| 分支模式 | 类型 | 基础分支 |
|---------|------|---------|
| `<type>/<slug>-t<NN>` | 任务子分支 | 父分支 |
| feat/* (无 `-t` 后缀) | 功能开发 | develop |
| fix/* (无 `-t` 后缀) | Bug 修复 | develop |
| refactor/* (无 `-t` 后缀) | 代码重构 | develop |
| hotfix/* (无 `-t` 后缀) | 紧急修复 | master |
| release/* (无 `-t` 后缀) | 版本发布 | develop |
| develop | 开发集成 | 无 |
| master | 生产环境 | 无 |

## 输出示例

### 子分支状态

```
╔════════════════════════════════════════════════╗
║              Git 分支状态                       ║
╠════════════════════════════════════════════════╣
║ 当前分支: feat/user-auth-t01                   ║
║ 分支类型: 任务子分支 (feat)                     ║
║ 父分支:   feat/user-auth                       ║
╠════════════════════════════════════════════════╣
║ 📊 提交状态                                     ║
║   - 领先父分支: 2 个提交                        ║
║   - 落后父分支: 0 个提交                        ║
╠════════════════════════════════════════════════╣
║ 📝 未提交更改                                   ║
║   M  src/components/Login.tsx                  ║
╚════════════════════════════════════════════════╝

💡 建议操作:
1. 提交更改: /git:commit
2. 从父分支同步: /git:sync
3. 完成任务: /git:finish (合并到父分支)
```

### 父分支状态（额外显示子分支列表）

```
╔════════════════════════════════════════════════╗
║              Git 分支状态                       ║
╠════════════════════════════════════════════════╣
║ 当前分支: feat/user-auth                        ║
║ 分支类型: 功能开发 (集成分支)                    ║
║ 基础分支: develop                               ║
╠════════════════════════════════════════════════╣
║ 📊 提交状态                                     ║
║   - 领先基础分支: 3 个提交                       ║
║   - 落后基础分支: 1 个提交                       ║
╠════════════════════════════════════════════════╣
║ 📋 任务子分支                                   ║
║   ✅ feat/user-auth-t01 (已合并)               ║
║   🔵 feat/user-auth-t02 (进行中，+3 commits)  ║
║   ⬜ feat/user-auth-t03                        ║
╚════════════════════════════════════════════════╝

💡 建议操作:
1. 创建任务分支: /git:start-task
2. 同步代码: /git:sync
3. 完成集成: /git:finish (合并到 develop)
```

### 子分支列表检测

当当前分支是集成分支时，扫描本地分支查找子分支：

```bash
CURRENT_SLUG=$(echo "$CURRENT_BRANCH" | sed 's|^\(feat\|fix\|refactor\|hotfix\|release\)/||')
BRANCH_TYPE=$(echo "$CURRENT_BRANCH" | sed 's|/.*||')
SUB_BRANCHES=$(git branch --list "${BRANCH_TYPE}/${CURRENT_SLUG}-t*")
```

对每个子分支检查：
- 是否已合并到当前分支 → `git branch --merged` 包含 → 标记 ✅
- 是否有未合并提交 → `git log --oneline ${CURRENT_BRANCH}..${sub_branch}` → 标记 🔵
- 否则 → 标记 ⬜

## 不同分支类型的建议

| 分支类型 | 建议操作流程 |
|---------|-------------|
| 子分支 | commit → sync → finish (合并到父分支) |
| feat/fix/refactor (集成分支) | start-task → sync → finish |
| hotfix (集成分支) | commit → finish（同时合并到 master 和 develop）|
| release | 测试 → publish |
| develop | 创建功能分支或任务分支开始工作 |
| master | 禁止直接操作 |

## 相关命令

- [/git:start-task](./start-task) - 创建任务子分支
- [/git:commit](./commit) - 智能提交
- [/git:sync](./sync) - 同步代码
- [/git:finish](./finish) - 完成并合并分支

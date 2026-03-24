---
name: git:status
description: 查看当前分支状态和下一步建议
allowed-tools:
  - Bash
---

<objective>
显示当前分支的详细状态，包括与基础分支的差异、未提交更改、以及下一步操作建议。
</objective>

<process>
1. 获取当前分支名
2. 识别分支类型和基础分支
3. 获取与基础分支的差异统计
4. 获取未提交更改列表
5. 根据分支状态给出操作建议
</process>

<execution>
## 获取分支信息

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# 识别分支类型和基础分支
case "$BRANCH" in
  feat/*)
    TYPE="功能开发"
    BASE="develop"
    ;;
  fix/*)
    TYPE="Bug 修复"
    BASE="develop"
    ;;
  refactor/*)
    TYPE="代码重构"
    BASE="develop"
    ;;
  hotfix/*)
    TYPE="紧急修复"
    BASE="master"
    ;;
  release/*)
    TYPE="版本发布"
    BASE="develop"
    ;;
  develop)
    TYPE="开发集成"
    BASE=""
    ;;
  master)
    TYPE="生产环境"
    BASE=""
    ;;
  *)
    TYPE="未知"
    BASE="develop"
    ;;
esac
```

## 获取差异统计

```bash
if [ -n "$BASE" ]; then
  AHEAD=$(git rev-list --count $BASE..HEAD 2>/dev/null || echo "0")
  BEHIND=$(git rev-list --count HEAD..origin/$BASE 2>/dev/null || echo "0")
fi
```

## 获取未提交更改

```bash
CHANGES=$(git status --porcelain)
STAGED=$(git diff --cached --stat 2>/dev/null)
UNSTAGED=$(git diff --stat 2>/dev/null)
```

## 输出格式

```
╔════════════════════════════════════════════════╗
║              Git 分支状态                       ║
╠════════════════════════════════════════════════╣
║ 当前分支: feat/add-user-profile                 ║
║ 分支类型: 功能开发                              ║
║ 基础分支: develop                               ║
╠════════════════════════════════════════════════╣
║ 📊 提交状态                                     ║
║   - 领先基础分支: 3 个提交                       ║
║   - 落后基础分支: 1 个提交                       ║
╠════════════════════════════════════════════════╣
║ 📝 未提交更改                                   ║
║   M  src/views/User.vue                        ║
║   A  src/api/user.js                           ║
╚════════════════════════════════════════════════╝

💡 建议操作:
1. 提交更改: /git:commit
2. 同步代码: /git:sync
3. 完成开发: /git:finish
```

## 不同分支类型的建议

- feat/fix/refactor: sync → commit → finish
- hotfix: commit → finish (会同时合并到 master 和 develop)
- release: 测试 → publish
- develop: 创建功能分支开始工作
- master: 禁止直接操作
</execution>

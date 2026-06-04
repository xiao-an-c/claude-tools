---
name: git:wip
description: 保存工作进度（WIP commit 或 stash）
allowed-tools:
  - Bash
  - AskUserQuestion
---

<objective>
保存当前工作进度，便于临时切换分支或保存中间状态。
</objective>

<process>
1. 检查当前是否有未提交的更改
2. 如果没有更改，提示用户
3. 询问用户选择保存方式：WIP commit 或 stash
4. 执行相应的保存操作
</process>

<execution>
## 检查更改

```bash
CHANGES=$(git status --porcelain)
if [ -z "$CHANGES" ]; then
  echo "没有未提交的更改，无需保存"
  exit 0
fi
```

## 询问保存方式

询问用户：
"选择保存方式："
1. WIP commit（创建提交，保留在历史中）
2. Stash（暂存，不创建提交）

## 方式1: WIP Commit

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")

git add -A
git commit -m "WIP: $BRANCH @ $TIMESTAMP"
```

## 方式2: Stash

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")

git stash push -m "WIP: $BRANCH @ $TIMESTAMP"
```

## 输出

✅ 工作进度已保存
📌 保存方式: <方式>
💡 提示:
- 如果使用 stash，可用 `git stash pop` 恢复
- 如果使用 WIP commit，可用 `git reset HEAD~1` 撤销
</execution>

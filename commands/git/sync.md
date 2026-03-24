---
name: git:sync
description: 同步基础分支的最新代码到当前分支
allowed-tools:
  - Bash
  - AskUserQuestion
---

<objective>
将基础分支（develop 或 master）的最新代码合并到当前分支，保持分支同步。
</objective>

<rules>
基础分支识别：
- feat/*, fix/*, refactor/* → 同步 develop
- hotfix/*, release/* → 同步 master
- develop, master → 不需要同步
</rules>

<process>
1. 获取当前分支名
2. 识别基础分支
3. 检查当前是否有未提交的更改
4. git fetch origin 获取远程更新
5. git merge origin/<base-branch> 合并基础分支
6. 如果有冲突，停止并提示用户手动解决
</process>

<execution>
## 获取当前分支

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
```

## 识别基础分支

```bash
case "$BRANCH" in
  feat/*|fix/*|refactor/*)
    BASE_BRANCH="develop"
    ;;
  hotfix/*|release/*)
    BASE_BRANCH="master"
    ;;
  develop|master)
    echo "当前在 $BRANCH 分支，无需同步基础分支"
    exit 0
    ;;
  *)
    # 询问用户要同步哪个分支
    ;;
esac
```

## 检查未提交更改

```bash
CHANGES=$(git status --porcelain)
if [ -n "$CHANGES" ]; then
  echo "有未提交的更改，请先提交或暂存："
  git status --short
  # 询问用户是否继续
fi
```

## 同步代码

```bash
git fetch origin
git merge origin/$BASE_BRANCH
```

## 冲突处理

如果合并出现冲突：
```
❌ 合并冲突！请手动解决：

1. 查看冲突文件: git status
2. 编辑冲突文件解决冲突
3. 标记已解决: git add <file>
4. 完成合并: git commit

冲突文件列表：
<conflicted files>
```

## 输出

✅ 已同步 `origin/<base-branch>` 到当前分支
📌 当前分支: `<branch>`
📊 基础分支: `<base-branch>`
</execution>

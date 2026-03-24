---
name: git:abort
description: 放弃当前分支，安全删除
allowed-tools:
  - Bash
  - AskUserQuestion
---

<objective>
安全地放弃当前工作分支，切换回基础分支并删除当前分支。
</objective>

<safety-checks>
1. 不允许在 master/develop 分支上执行
2. 检查是否有未推送的提交
3. 检查是否有未提交的更改
4. 需要用户确认
</safety-checks>

<process>
1. 获取当前分支名
2. 检查是否在保护分支
3. 检查未推送的提交和未提交的更改
4. 显示警告信息
5. 询问用户确认
6. 切换到基础分支
7. 删除当前分支
</process>

<execution>
## 获取分支信息

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# 检查是否在保护分支
if [ "$BRANCH" = "master" ] || [ "$BRANCH" = "develop" ]; then
  echo "❌ 不能放弃 $BRANCH 分支！"
  exit 1
fi

# 识别基础分支
case "$BRANCH" in
  feat/*|fix/*|refactor/*|release/*)
    BASE_BRANCH="develop"
    ;;
  hotfix/*)
    BASE_BRANCH="master"
    ;;
  *)
    BASE_BRANCH="develop"
    ;;
esac
```

## 检查未推送的提交

```bash
UNPUSHED=$(git log origin/$BRANCH..HEAD --oneline 2>/dev/null)
if [ -n "$UNPUSHED" ]; then
  echo "⚠️  警告: 有未推送的提交："
  echo "$UNPUSHED"
fi
```

## 检查未提交的更改

```bash
CHANGES=$(git status --porcelain)
if [ -n "$CHANGES" ]; then
  echo "⚠️  警告: 有未提交的更改："
  git status --short
fi
```

## 显示确认信息

```
⚠️  放弃分支确认

当前分支: feat/test-feature
基础分支: develop

将丢失的内容:
- 3 个未推送的提交
- 2 个未提交的文件修改

确认放弃此分支？此操作不可恢复！(y/n)
```

## 执行删除

```bash
if [确认]; then
  # 如果有未提交的更改，使用 -D 强制删除
  if [ -n "$CHANGES" ]; then
    git checkout $BASE_BRANCH
    git branch -D $BRANCH
  else
    git checkout $BASE_BRANCH
    git branch -d $BRANCH
  fi

  echo "✅ 已切换到 $BASE_BRANCH 并删除分支 $BRANCH"
fi
```

## 输出

✅ 分支已放弃

📋 操作摘要:
- 已切换到: `$BASE_BRANCH`
- 已删除: `$BRANCH`

💡 提示:
- 远程分支仍然存在，如需删除: `git push origin --delete $BRANCH`
- 如误删，可通过 `git reflog` 恢复
</execution>

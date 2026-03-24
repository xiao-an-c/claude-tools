---
name: git:finish
description: 完成当前工作，合并分支到目标分支
allowed-tools:
  - Bash
  - AskUserQuestion
---

<objective>
完成当前分支的工作，根据分支类型合并到目标分支并清理。
</objective>

<rules>
合并规则：
- feat/fix/refactor → 合并到 develop
- hotfix → 合并到 master（打 tag）+ develop
- release → 提示使用 /git:publish
- develop/master → 禁止操作
</rules>

<process>
1. 获取当前分支名和类型
2. 检查未提交的更改，如有则提示提交
3. 根据分支类型执行不同的合并流程
4. 询问是否删除当前分支
</process>

<execution>
## 获取分支信息

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# 检查是否在保护分支
if [ "$BRANCH" = "master" ] || [ "$BRANCH" = "develop" ]; then
  echo "❌ 不能在 $BRANCH 分支上执行 finish 操作"
  exit 1
fi

# 检查是否是 release 分支
if [[ "$BRANCH" == release/* ]]; then
  echo "📦 release 分支请使用 /git:publish 发布到 master"
  exit 0
fi
```

## 检查未提交更改

```bash
CHANGES=$(git status --porcelain)
if [ -n "$CHANGES" ]; then
  echo "❌ 有未提交的更改，请先提交："
  git status --short
  exit 1
fi
```

## feat/fix/refactor 分支

```bash
# 切换到 develop 并拉取
git checkout develop
git pull origin develop

# 合并功能分支
git merge $BRANCH --no-ff -m "Merge $BRANCH into develop"

# 推送到远程
git push origin develop
```

## hotfix 分支

```bash
# 1. 合并到 master
git checkout master
git pull origin master
git merge $BRANCH --no-ff -m "Merge $BRANCH into master (hotfix)"

# 2. 获取版本号并打 tag
# 从 package.json 或询问用户获取版本号
TAG_VERSION=$(node -p "require('./package.json').version" 2>/dev/null)
if [ -z "$TAG_VERSION" ]; then
  # 询问用户版本号
fi
git tag -a "v$TAG_VERSION" -m "Hotfix v$TAG_VERSION"

# 3. 推送 master 和 tags
git push origin master --tags

# 4. 同步到 develop
git checkout develop
git pull origin develop
git merge $BRANCH --no-ff -m "Merge $BRANCH into develop (hotfix sync)"
git push origin develop
```

## 询问删除分支

合并成功后询问用户：
"是否删除本地分支 $BRANCH？(y/n)"

如果确认删除：
```bash
git branch -d $BRANCH

# 询问是否删除远程分支
git push origin --delete $BRANCH 2>/dev/null || true
```

## 输出

✅ 合并完成！

📋 操作摘要:
- 分支: `$BRANCH` → `$TARGET`
- 合并方式: --no-ff
- 分支清理: 已删除/保留

💡 下一步:
- 检查 CI/CD 状态
- 通知团队成员拉取最新代码
</execution>

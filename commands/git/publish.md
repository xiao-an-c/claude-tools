---
name: git:publish
description: 发布 release 分支到 master（打 tag 并同步回 develop）
allowed-tools:
  - Bash
  - AskUserQuestion
---

<objective>
将 release 分支发布到 master，打版本标签，并同步回 develop。
</objective>

<prerequisites>
- 必须在 release/* 分支上执行
- 所有测试必须通过
- package.json 版本号已更新
</prerequisites>

<process>
1. 确认当前在 release 分支
2. 获取版本号
3. 确认发布信息
4. 合并到 master 并打 tag
5. 推送 master 和 tags
6. 同步回 develop
7. 清理 release 分支
</process>

<execution>
## 检查分支

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [[ "$BRANCH" != release/* ]]; then
  echo "❌ 只能在 release/* 分支上执行发布操作"
  echo "当前分支: $BRANCH"
  exit 1
fi
```

## 获取版本号

```bash
# 从分支名提取版本号
VERSION=${BRANCH#release/}

# 或从 package.json 读取
PKG_VERSION=$(node -p "require('./package.json').version" 2>/dev/null)

if [ "$VERSION" != "v$PKG_VERSION" ]; then
  echo "⚠️  分支版本 ($VERSION) 与 package.json 版本 (v$PKG_VERSION) 不一致"
  # 询问用户使用哪个版本
fi
```

## 确认发布

显示发布信息并询问确认：
```
📦 发布确认

版本: v1.2.0
分支: release/v1.2.0 → master
同步: release/v1.2.0 → develop

确认发布？(y/n)
```

## 执行发布

```bash
# 1. 合并到 master
git checkout master
git pull origin master
git merge $BRANCH --no-ff -m "Release $VERSION"

# 2. 打 tag
git tag -a "$VERSION" -m "Release $VERSION"

# 3. 推送 master 和 tags
git push origin master --tags

# 4. 同步回 develop
git checkout develop
git pull origin develop
git merge $BRANCH --no-ff -m "Sync release $VERSION to develop"
git push origin develop
```

## 清理分支

询问用户：
"是否删除 release 分支 $BRANCH？(y/n)"

```bash
if [确认]; then
  git branch -d $BRANCH
  git push origin --delete $BRANCH 2>/dev/null || true
fi
```

## 输出

🎉 发布成功！

📋 发布摘要:
- 版本: `$VERSION`
- Tag: `$VERSION`
- master: 已更新并推送
- develop: 已同步
- 分支: `$BRANCH` 已删除/保留

💡 下一步:
- 检查 CI/CD 部署状态
- 通知团队成员
- 更新 Release Notes
</execution>

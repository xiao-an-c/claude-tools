# /git:publish

发布 release 分支到 master（打 tag 并同步回 develop）。

## 用法

```bash
/git:publish
```

## 前置条件

- 必须在 release/* 分支上执行
- 所有测试必须通过
- package.json 版本号已更新

## 功能

- 将 release 分支发布到 master
- 打版本标签
- 同步回 develop
- 可选删除 release 分支

## 执行流程

1. 确认当前在 release 分支
2. 获取版本号
3. 确认发布信息
4. 合并到 master 并打 tag
5. 推送 master 和 tags
6. 同步回 develop
7. 清理 release 分支

## 发布确认

```
📦 发布确认

版本: v1.2.0
分支: release/v1.2.0 → master
同步: release/v1.2.0 → develop

确认发布？(y/n)
```

## 执行命令

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

## 输出示例

```
🎉 发布成功！

📋 发布摘要:
- 版本: `v1.2.0`
- Tag: `v1.2.0`
- master: 已更新并推送
- develop: 已同步
- 分支: `release/v1.2.0` 已删除

💡 下一步:
- 检查 CI/CD 部署状态
- 通知团队成员
- 更新 Release Notes
```

## 相关命令

- [/git:start-release](./start-release) - 创建发布分支
- [/git:finish](./finish) - 完成功能分支
- [/git:commit](./commit) - 智能提交

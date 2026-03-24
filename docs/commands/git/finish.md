# /git:finish

完成当前工作，合并分支到目标分支。

## 用法

```bash
/git:finish
```

## 功能

- 根据分支类型合并到目标分支
- 自动处理合并流程
- 询问是否删除当前分支

## 合并规则

| 分支类型 | 合并目标 |
|---------|---------|
| feat/fix/refactor | 合并到 develop |
| hotfix | 合并到 master（打 tag）+ develop |
| release | 提示使用 /git:publish |
| develop/master | 禁止操作 |

## 执行流程

1. 获取当前分支名和类型
2. 检查未提交的更改
3. 根据分支类型执行不同的合并流程
4. 询问是否删除当前分支

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

hotfix 会同时合并到 master 和 develop：

```bash
# 1. 合并到 master
git checkout master
git pull origin master
git merge $BRANCH --no-ff -m "Merge $BRANCH into master (hotfix)"

# 2. 打 tag
git tag -a "v[version]" -m "Hotfix v[version]"

# 3. 推送 master 和 tags
git push origin master --tags

# 4. 同步到 develop
git checkout develop
git pull origin develop
git merge $BRANCH --no-ff -m "Merge $BRANCH into develop (hotfix sync)"
git push origin develop
```

## 输出示例

```
✅ 合并完成！

📋 操作摘要:
- 分支: `feat/user-profile` → `develop`
- 合并方式: --no-ff
- 分支清理: 已删除

💡 下一步:
- 检查 CI/CD 状态
- 通知团队成员拉取最新代码
```

::: warning 注意
release 分支请使用 /git:publish 发布到 master。
:::

## 相关命令

- [/git:commit](./commit) - 智能提交
- [/git:sync](./sync) - 同步基础分支
- [/git:publish](./publish) - 发布 release 分支
- [/git:abort](./abort) - 放弃当前分支

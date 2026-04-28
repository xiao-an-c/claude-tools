# /git:publish

发布 release 分支到 master（自动生成 Release Notes、打 tag 并同步回 develop）。

## 用法

```bash
/git:publish
```

## 前置条件

- 必须在 release/* 分支上执行
- 所有测试必须通过
- package.json 版本号已更新

## 功能

- 自动从 commits 生成分类 Release Notes
- 将 release 分支发布到 master
- 打带 Release Notes 的版本标签
- 同步回 develop
- 可选删除 release 分支

## 执行流程

1. 确认当前在 release 分支
2. 获取版本号
3. 对比上一个 tag，提取变更并按类型分组
4. 生成 Release Notes 并预览确认
5. 合并到 master 并打 tag
6. 推送 master 和 tags
7. 同步回 develop
8. 清理 release 分支

## Release Notes 生成规则

从上一个 tag 到当前 HEAD 的所有 commits（排除 merge commits 和 bump commits），按 Conventional Commits 类型分组：

| 分类 | 匹配前缀 | 说明 |
|------|----------|------|
| Features | `feat`, `feature` | 新功能 |
| Bug Fixes | `fix` | 修复 |
| Refactoring | `refactor`, `perf` | 重构/性能优化 |
| Documentation | `docs` | 文档 |
| Tests | `test` | 测试 |
| Other Changes | 其余 | 未分类变更 |

自动去除 commit message 中的类型前缀（如 `feat(cli):` → `-`），附加上贡献者列表和 Full Changelog 链接。

## 发布确认

```
📦 发布确认

版本: v0.3.0
分支: release/v0.3.0 → master
同步: release/v0.3.0 → develop

--- Release Notes 预览 ---
Release v0.3.0

## 🚀 Features

- add interactive select component
- add search filter for branches

## 🐛 Bug Fixes

- fix merge conflict resolution

## 👥 Contributors

- DengLian

---
**Total commits:** 12
**Full Changelog:** .../compare/v0.2.0...v0.3.0
--- 预览结束 ---

确认发布？(y/n)
```

## 执行命令

```bash
# 1. 生成 Release Notes（从上一个 tag 提取变更）
PREV_TAG=$(git tag --sort=version:refname | tail -1)
# ... 按类型分组 commits，构建 TAG_MSG ...

# 2. 合并到 master
git checkout master
git pull origin master
git merge $BRANCH --no-ff -m "Release $VERSION"

# 3. 打 tag（使用生成的 Release Notes）
git tag -a "$VERSION" -F "$TAG_FILE"
rm -f "$TAG_FILE"

# 4. 推送 master 和 tags
git push origin master --tags

# 5. 同步回 develop
git checkout develop
git pull origin develop
git merge $BRANCH --no-ff -m "Sync release $VERSION to develop"
git push origin develop
```

## 输出示例

```
🎉 发布成功！

📋 发布摘要:
- 版本: `v0.3.0`
- Tag: `v0.3.0`（含自动生成的 Release Notes）
- master: 已更新并推送
- develop: 已同步
- 分支: `release/v0.3.0` 已删除

💡 下一步:
- 检查 CI/CD 部署状态
- 通知团队成员
- 查看 tag release notes: git tag -n99 v0.3.0
```

## 相关命令

- [/git:start-release](./start-release) - 创建发布分支
- [/git:finish](./finish) - 完成功能分支
- [/git:commit](./commit) - 智能提交

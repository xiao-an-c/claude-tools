# /git:abort

放弃当前分支，安全删除。

## 用法

```bash
/git:abort
```

## 功能

- 安全地放弃当前工作分支
- 切换回基础分支
- 删除当前分支

## 安全检查

1. 不允许在 master/develop 分支上执行
2. 检查是否有未推送的提交
3. 检查是否有未提交的更改
4. 需要用户确认

## 执行流程

1. 获取当前分支名
2. 检查是否在保护分支
3. 检查未推送的提交和未提交的更改
4. 显示警告信息
5. 询问用户确认
6. 切换到基础分支
7. 删除当前分支

## 确认信息

```
⚠️  放弃分支确认

当前分支: feat/test-feature
基础分支: develop

将丢失的内容:
- 3 个未推送的提交
- 2 个未提交的文件修改

确认放弃此分支？此操作不可恢复！(y/n)
```

## 输出示例

```
✅ 分支已放弃

📋 操作摘要:
- 已切换到: `develop`
- 已删除: `feat/test-feature`

💡 提示:
- 远程分支仍然存在，如需删除: `git push origin --delete feat/test-feature`
- 如误删，可通过 `git reflog` 恢复
```

::: danger 危险操作
此操作会永久删除本地分支和未推送的提交，请谨慎使用。
:::

## 恢复误删分支

如果误删分支，可以通过以下方式恢复：

```bash
# 查看操作历史
git reflog

# 找到删除前的 commit hash，恢复分支
git checkout -b [branch-name] [commit-hash]
```

## 相关命令

- [/git:finish](./finish) - 完成并合并分支
- [/git:status](./status) - 查看分支状态
- [/git:wip](./wip) - 保存工作进度

# /git:wip

保存工作进度（WIP commit 或 stash）。

## 用法

```bash
/git:wip
```

## 功能

- 保存当前工作进度
- 便于临时切换分支或保存中间状态
- 提供两种保存方式

## 保存方式

| 方式 | 说明 | 适用场景 |
|------|------|---------|
| WIP commit | 创建提交，保留在历史中 | 需要推送或记录 |
| Stash | 暂存，不创建提交 | 临时保存，快速切换 |

## 执行流程

1. 检查是否有未提交的更改
2. 如果没有更改，提示用户
3. 询问用户选择保存方式
4. 执行相应的保存操作

## WIP Commit 方式

```bash
git add -A
git commit -m "WIP: [branch] @ [timestamp]"
```

## Stash 方式

```bash
git stash push -m "WIP: [branch] @ [timestamp]"
```

## 输出示例

```
✅ 工作进度已保存
📌 保存方式: WIP commit
💡 提示:
- 如果使用 stash，可用 `git stash pop` 恢复
- 如果使用 WIP commit，可用 `git reset HEAD~1` 撤销
```

## 恢复进度

- **Stash**: `git stash pop` 或 `git stash apply`
- **WIP commit**: `git reset HEAD~1` 撤销提交但保留更改

## 相关命令

- [/git:commit](./commit) - 智能提交
- [/git:status](./status) - 查看分支状态

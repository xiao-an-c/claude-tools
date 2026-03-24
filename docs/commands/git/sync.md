# /git:sync

同步基础分支的最新代码到当前分支。

## 用法

```bash
/git:sync
```

## 功能

- 将基础分支的最新代码合并到当前分支
- 保持分支与基础分支同步
- 自动识别基础分支

## 基础分支识别

| 当前分支类型 | 同步目标 |
|-------------|---------|
| feat/*, fix/*, refactor/* | develop |
| hotfix/*, release/* | master |
| develop, master | 无需同步 |

## 执行流程

1. 获取当前分支名
2. 识别基础分支
3. 检查未提交更改
4. git fetch origin 获取远程更新
5. git merge origin/[base-branch] 合并基础分支
6. 如果有冲突，停止并提示手动解决

## 冲突处理

如果合并出现冲突：

```
❌ 合并冲突！请手动解决：

1. 查看冲突文件: git status
2. 编辑冲突文件解决冲突
3. 标记已解决: git add [file]
4. 完成合并: git commit

冲突文件列表：
[conflicted files]
```

## 输出示例

```
✅ 已同步 `origin/develop` 到当前分支
📌 当前分支: `feat/user-profile`
📊 基础分支: `develop`
```

## 相关命令

- [/git:status](./status) - 查看分支状态
- [/git:commit](./commit) - 智能提交
- [/git:finish](./finish) - 完成并合并分支

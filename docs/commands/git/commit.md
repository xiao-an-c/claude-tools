# /git:commit

智能提交，根据分支类型自动添加 commit 前缀。

## 用法

```bash
/git:commit [message]
```

## 功能

- 根据当前分支类型自动生成 commit 前缀
- 分析修改的文件路径推断 scope
- 禁止在 master 分支直接提交

## 分支类型与 commit 前缀

| 分支类型 | commit 格式 |
|----------|-------------|
| feat/* | `feat(scope): [message]` |
| fix/* | `fix(scope): [message]` |
| refactor/* | `refactor(scope): [message]` |
| hotfix/* | `fix(scope): [紧急] [message]` |
| release/* | `chore(release): [message]` |
| develop | `chore: [message]` |
| master | 禁止直接提交 |

## Scope 推断规则

根据修改的文件路径自动推断 scope：

| 文件路径 | scope |
|----------|-------|
| src/views/* | 页面名 |
| src/api/* | api |
| src/components/* | 组件名 |
| src/utils/* | utils |
| src/store/* | store |

## 执行流程

1. 获取当前分支名，识别分支类型
2. 如果在 master 分支，拒绝提交并提示
3. 分析 git diff --stat 获取修改范围作为 scope
4. 如果用户提供了 message，使用它；否则分析更改自动生成
5. 构建完整的 commit 信息
6. 执行 git add -A 和 git commit

## 输出示例

```
✅ 提交成功: `feat(user): 添加用户资料页面`
📊 当前分支: `feat/user-profile`
💡 提示: 使用 /git:sync 同步基础分支，或 /git:finish 完成开发
```

## 相关命令

- [/git:sync](./sync) - 同步基础分支代码
- [/git:finish](./finish) - 完成并合并分支

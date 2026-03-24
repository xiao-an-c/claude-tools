# /git:start-fix

开始 Bug 修复，从 develop 创建 fix/* 分支。

## 用法

```bash
/git:start-fix [description]
```

## 参数

- `description`: Bug 描述，用于分支命名（如 login-error）

## 功能

- 从 develop 分支创建新的修复分支
- 自动暂存未提交更改
- 拉取最新代码后创建分支

## 执行流程

1. 获取 Bug 描述（如果没有参数则询问）
2. 检查未提交更改，有则暂存
3. 切换到 develop 分支并拉取最新代码
4. 创建修复分支 fix/[description]
5. 恢复暂存的更改

## 输出示例

```
✅ 已创建修复分支: `fix/login-error`
📌 基础分支: develop
💡 提示: 修复完成后使用 /git:finish 合并分支
```

## 完整工作流

```bash
# 1. 开始修复
/git:start-fix login-error

# 2. 修复并提交
/git:commit 修复登录失败问题

# 3. 完成修复
/git:finish
```

## 相关命令

- [/git:commit](./commit) - 智能提交
- [/git:finish](./finish) - 完成并合并分支
- [/git:start-feat](./start-feat) - 开始新功能

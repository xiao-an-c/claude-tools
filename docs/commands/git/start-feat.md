# /git:start-feat

开始新功能开发，从 develop 创建 feat/* 分支。

## 用法

```bash
/git:start-feat [description]
```

## 参数

- `description`: 功能描述，用于分支命名（如 user-profile）

## 功能

- 从 develop 分支创建新的功能分支
- 自动暂存未提交更改
- 拉取最新代码后创建分支

## 执行流程

1. 获取功能描述（如果没有参数则询问）
2. 检查未提交更改，有则暂存
3. 切换到 develop 分支并拉取最新代码
4. 创建功能分支 feat/[description]
5. 恢复暂存的更改

## 输出示例

```
✅ 已创建功能分支: `feat/user-profile`
📌 基础分支: develop
💡 提示: 开发完成后使用 /git:finish 合并分支
```

## 完整工作流

```bash
# 1. 开始功能
/git:start-feat user-profile

# 2. 开发并提交
/git:commit 添加用户资料页面

# 3. 完成功能
/git:finish
```

## 相关命令

- [/git:commit](./commit) - 智能提交
- [/git:finish](./finish) - 完成并合并分支
- [/git:start-fix](./start-fix) - 开始 Bug 修复

# /git:start-hotfix

开始紧急修复，从 master 创建 hotfix/* 分支。

## 用法

```bash
/git:start-hotfix [description]
```

## 参数

- `description`: 紧急修复描述，用于分支命名（如 payment-crash）

## 功能

- 从 master 分支创建紧急修复分支
- 自动暂存未提交更改
- 拉取最新代码后创建分支

## 执行流程

1. 获取修复描述（如果没有参数则询问）
2. 检查未提交更改，有则暂存
3. 切换到 master 分支并拉取最新代码
4. 创建紧急修复分支 hotfix/[description]
5. 恢复暂存的更改

## 输出示例

```
🚨 已创建紧急修复分支: `hotfix/payment-crash`
📌 基础分支: master
⚠️  注意: 紧急修复完成后会同时合并到 master 和 develop
💡 提示: 修复完成后使用 /git:finish 合并并发布
```

## 紧急修复流程

```bash
# 1. 开始紧急修复
/git:start-hotfix payment-crash

# 2. 修复并提交
/git:commit 修复支付崩溃问题

# 3. 完成（自动合并到 master + develop）
/git:finish
```

::: warning 注意
hotfix 分支完成后会自动合并到 master（打 tag）和 develop 两个分支。
:::

## 相关命令

- [/git:commit](./commit) - 智能提交
- [/git:finish](./finish) - 完成并合并分支
- [/git:start-fix](./start-fix) - 普通 Bug 修复

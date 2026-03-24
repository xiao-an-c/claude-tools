# /git:start-refactor

开始代码重构，从 develop 创建 refactor/* 分支。

## 用法

```bash
/git:start-refactor [description]
```

## 参数

- `description`: 重构描述，用于分支命名（如 api-layer）

## 功能

- 从 develop 分支创建新的重构分支
- 自动暂存未提交更改
- 拉取最新代码后创建分支

## 执行流程

1. 获取重构描述（如果没有参数则询问）
2. 检查未提交更改，有则暂存
3. 切换到 develop 分支并拉取最新代码
4. 创建重构分支 refactor/[description]
5. 恢复暂存的更改

## 输出示例

```
✅ 已创建重构分支: `refactor/api-layer`
📌 基础分支: develop
💡 提示: 重构完成后使用 /git:finish 合并分支
```

## 重构工作流

```bash
# 1. 开始重构
/git:start-refactor api-layer

# 2. 重构并提交
/git:commit 重构 API 调用层

# 3. 完成重构
/git:finish
```

## 相关命令

- [/git:commit](./commit) - 智能提交
- [/git:finish](./finish) - 完成并合并分支
- [/git:start-feat](./start-feat) - 开始新功能

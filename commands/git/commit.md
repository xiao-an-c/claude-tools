---
name: git:commit
description: 智能提交，根据分支类型自动添加 commit 前缀
allowed-tools:
  - Bash
  - AskUserQuestion
---

<objective>
根据当前分支类型自动生成符合规范的 commit 信息，执行 git add 和 git commit。
</objective>

<rules>
分支类型对应的 commit 前缀：
- feat/*     → feat(scope): <message>
- fix/*      → fix(scope): <message>
- refactor/* → refactor(scope): <message>
- hotfix/*   → fix(scope): [紧急] <message>
- release/*  → chore(release): <message>
- develop    → chore: <message>
- master     → 禁止直接提交

scope 通过分析修改的文件路径自动推断。
</rules>

<process>
1. 获取当前分支名，识别分支类型
2. 如果在 master 分支，拒绝提交并提示
3. 分析 git diff --stat 获取修改范围作为 scope
4. 如果用户提供了 message，使用它；否则分析更改自动生成
5. 构建完整的 commit 信息
6. 执行 git add -A 和 git commit
</process>

<execution>
## 获取当前分支

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
```

## 检查是否在 master

如果在 master 分支，输出错误并停止：
"❌ 禁止直接在 master 分支提交！请使用功能分支。"

## 分析修改范围

```bash
# 获取修改的文件统计
git diff --stat --cached 2>/dev/null || git diff --stat
```

根据修改的文件路径推断 scope：
- src/views/* → 页面名
- src/api/* → api
- src/components/* → 组件名
- src/utils/* → utils
- src/store/* → store
- 多个不同目录 → 根据主要修改推断

## 构建 commit 信息

如果用户提供了 message：
```
<type>(<scope>): <message>
```

如果没有提供 message，询问用户：
"请输入提交信息："

## 执行提交

```bash
git add -A
git commit -m "<type>(<scope>): <message>"
```

## 输出

✅ 提交成功: `<type>(<scope>): <message>`
📊 当前分支: `<branch>`
💡 提示: 使用 `/git:sync` 同步基础分支，或 `/git:finish` 完成开发
</execution>

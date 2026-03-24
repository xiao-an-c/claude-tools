---
name: git:start-hotfix
description: 开始紧急修复，从 master 创建 hotfix/* 分支
allowed-tools:
  - Bash
  - AskUserQuestion
---

<objective>
从 master 分支创建紧急修复分支 hotfix/<description>，用于线上紧急问题的修复。
</objective>

<process>
1. 获取用户输入的修复描述（如果没有参数则询问）
2. 检查当前是否有未提交的更改
   - 如果有，使用 git stash 暂存
3. 切换到 master 分支并拉取最新代码
4. 创建新的紧急修复分支 hotfix/<description>
5. 如果之前有 stash，恢复更改
6. 输出下一步操作提示（强调紧急修复流程）
</process>

<execution>
## 获取修复描述

如果用户没有提供描述，询问用户：
"请输入紧急修复描述（用于分支命名，如 payment-crash）："

## 执行命令

```bash
# 检查未提交更改
CHANGES=$(git status --porcelain)
STASHED=false

if [ -n "$CHANGES" ]; then
  echo "发现未提交更改，正在暂存..."
  git stash push -m "WIP: auto-stash before start-hotfix"
  STASHED=true
fi

# 切换到 master 并拉取
git checkout master
git pull origin master

# 创建紧急修复分支
git checkout -b hotfix/<description>

# 恢复暂存的更改
if [ "$STASHED" = true ]; then
  git stash pop
fi
```

## 输出

🚨 已创建紧急修复分支: `hotfix/<description>`
📌 基础分支: master
⚠️  注意: 紧急修复完成后会同时合并到 master 和 develop
💡 提示: 修复完成后使用 `/git:finish` 合并并发布
</execution>

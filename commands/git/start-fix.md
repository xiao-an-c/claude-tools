---
name: git:start-fix
description: 开始 Bug 修复，从 develop 创建 fix/* 分支
allowed-tools:
  - Bash
  - AskUserQuestion
---

<objective>
从 develop 分支创建新的修复分支 fix/<description>，开始 Bug 修复。
</objective>

<process>
1. 获取用户输入的修复描述（如果没有参数则询问）
2. 检查当前是否有未提交的更改
   - 如果有，使用 git stash 暂存
3. 切换到 develop 分支并拉取最新代码
4. 创建新的修复分支 fix/<description>
5. 如果之前有 stash，恢复更改
6. 输出下一步操作提示
</process>

<execution>
## 获取修复描述

如果用户没有提供描述，询问用户：
"请输入 Bug 描述（用于分支命名，如 login-error）："

## 执行命令

```bash
# 检查未提交更改
CHANGES=$(git status --porcelain)
STASHED=false

if [ -n "$CHANGES" ]; then
  echo "发现未提交更改，正在暂存..."
  git stash push -m "WIP: auto-stash before start-fix"
  STASHED=true
fi

# 切换到 develop 并拉取
git checkout develop
git pull origin develop

# 创建修复分支
git checkout -b fix/<description>

# 恢复暂存的更改
if [ "$STASHED" = true ]; then
  git stash pop
fi
```

## 输出

✅ 已创建修复分支: `fix/<description>`
📌 基础分支: develop
💡 提示: 修复完成后使用 `/git:finish` 合并分支
</execution>

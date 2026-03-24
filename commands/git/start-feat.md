---
name: git:start-feat
description: 开始新功能开发，从 develop 创建 feat/* 分支
allowed-tools:
  - Bash
  - AskUserQuestion
---

<objective>
从 develop 分支创建新的功能分支 feat/<description>，开始新功能开发。
</objective>

<process>
1. 获取用户输入的功能描述（如果没有参数则询问）
2. 检查当前是否有未提交的更改
   - 如果有，使用 git stash 暂存
3. 切换到 develop 分支并拉取最新代码
4. 创建新的功能分支 feat/<description>
5. 如果之前有 stash，恢复更改
6. 输出下一步操作提示
</process>

<execution>
## 获取功能描述

如果用户没有提供描述，询问用户：
"请输入功能描述（用于分支命名，如 user-profile）："

## 执行命令

```bash
# 检查未提交更改
CHANGES=$(git status --porcelain)
STASHED=false

if [ -n "$CHANGES" ]; then
  echo "发现未提交更改，正在暂存..."
  git stash push -m "WIP: auto-stash before start-feat"
  STASHED=true
fi

# 切换到 develop 并拉取
git checkout develop
git pull origin develop

# 创建功能分支
git checkout -b feat/<description>

# 恢复暂存的更改
if [ "$STASHED" = true ]; then
  git stash pop
fi
```

## 输出

✅ 已创建功能分支: `feat/<description>`
📌 基础分支: develop
💡 提示: 开发完成后使用 `/git:finish` 合并分支
</execution>

---
name: git:init
description: 初始化项目 Git 分支规范，创建 master/develop 分支
allowed-tools:
  - Bash
  - AskUserQuestion
---

<objective>
将现存项目转化为符合 Git 分支规范的格式，确保存在主分支（master/main）和 develop 分支。
</objective>

<process>
1. 检查是否是 git 仓库
2. 检查未提交更改，有则暂存
3. 检测现有分支，确定主分支名称
4. 创建 develop 分支（如果不存在）
5. 恢复暂存的更改
6. 输出初始化结果
</process>

<execution>
## 检查 Git 仓库

```bash
# 检查是否是 git 仓库
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "❌ 当前目录不是 Git 仓库"
  echo "💡 请先运行: git init"
  exit 1
fi
```

## 暂存未提交更改

```bash
CHANGES=$(git status --porcelain)
STASHED=false

if [ -n "$CHANGES" ]; then
  echo "📦 发现未提交更改，正在暂存..."
  git stash push -m "WIP: auto-stash before git:init"
  STASHED=true
fi
```

## 获取现有分支

```bash
# 获取所有本地分支
BRANCHES=$(git branch --format='%(refname:short)')
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# 检查主分支是否存在
HAS_MASTER=$(echo "$BRANCHES" | grep -c "^master$" || echo "0")
HAS_MAIN=$(echo "$BRANCHES" | grep -c "^main$" || echo "0")
HAS_DEVELOP=$(echo "$BRANCHES" | grep -c "^develop$" || echo "0")
```

## 确定主分支

### 情况1：已有 master
```bash
if [ "$HAS_MASTER" -gt 0 ]; then
  MAIN_BRANCH="master"
  echo "✅ 检测到主分支: master"
```

### 情况2：已有 main 但无 master
```bash
elif [ "$HAS_MAIN" -gt 0 ]; then
  MAIN_BRANCH="main"
  echo "✅ 检测到主分支: main"
```

### 情况3：两者都没有
```bash
else
  # 询问用户选择主分支名称
  echo "未检测到 master 或 main 分支"
  echo "请选择主分支名称:"
  echo "  1. master (传统命名)"
  echo "  2. main (现代命名)"

  # 使用 AskUserQuestion 工具询问
  # 用户选择后设置 MAIN_BRANCH
```

## 检查是否已初始化

```bash
if [ "$HAS_DEVELOP" -gt 0 ]; then
  echo "✅ 项目已初始化过分支规范"
  echo "   主分支: $MAIN_BRANCH"
  echo "   开发分支: develop"

  # 恢复暂存
  if [ "$STASHED" = true ]; then
    git stash pop
  fi
  exit 0
fi
```

## 创建 develop 分支

```bash
echo "🔨 正在创建 develop 分支..."

# 切换到主分支
git checkout "$MAIN_BRANCH" 2>/dev/null || git checkout -b "$MAIN_BRANCH"

# 从主分支创建 develop
git checkout -b develop

echo "✅ 已创建 develop 分支"
```

## 恢复暂存的更改

```bash
if [ "$STASHED" = true ]; then
  echo "📦 正在恢复暂存的更改..."
  git stash pop
fi
```

## 输出结果

```
╔════════════════════════════════════════════════╗
║          Git 分支规范初始化完成                  ║
╠════════════════════════════════════════════════╣
║ ✅ 主分支: <MAIN_BRANCH>                        ║
║ ✅ 开发分支: develop                            ║
╠════════════════════════════════════════════════╣
║ 📌 下一步:                                      ║
║    /git:start-feat <description> 开始新功能     ║
║    /git:start-fix <description> 开始修复        ║
╚════════════════════════════════════════════════╝
```

## 错误处理

- 如果切换分支失败，停止并提示用户
- 如果创建分支失败，恢复暂存并提示用户
- 如果 stash pop 有冲突，提示用户手动解决
</execution>

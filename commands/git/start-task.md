---
name: git:start-task
description: 从当前分支创建任务子分支（自动编号）
allowed-tools: [Bash, AskUserQuestion]
---

# /git:start-task — 从当前分支创建任务子分支

从当前集成分支创建一个任务子分支，自动编号。

## 用法

```bash
/git:start-task [描述]
```

## 功能

- 在当前集成分支下创建任务子分支
- 自动检测已有子分支并分配编号
- 保持与父分支相同的分支类型

## 命名规则

子分支命名格式：`<type>/<parent-slug>-t<NN>`

例如当前分支 `feat/user-auth`：
- 第一个子分支：`feat/user-auth-t01`
- 第二个子分支：`feat/user-auth-t02`

## 父子关系检测

通过正则匹配检测子分支：`^(feat|fix|refactor|hotfix|release)/(.+)-t\d+$`

- 匹配成功 → 是子分支，去掉 `-t\d+` 即为父分支名
- 不匹配 → 是普通集成分支或独立分支

## 执行流程

### 1. 获取当前分支

```bash
CURRENT_BRANCH=$(git branch --show-current)
```

### 2. 验证当前分支类型

检查当前分支是否匹配集成分支模式：`^(feat|fix|refactor|hotfix|release)/(.+)$`

- 如果当前分支本身是子分支（匹配 `(.+)-t\d+$`） → 拒绝创建，提示先切回父分支
- 如果当前分支是 `develop`、`master`、`main` → 提示先创建或切换到集成分支
- 如果当前分支是集成分支 → 继续

### 3. 检查未提交更改

```bash
if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
  git stash push -m "start-task-auto-stash" --include-untracked
  STASH_NEEDED=true
fi
```

### 4. 扫描已有子分支，确定下一个编号

```bash
PREFIX=$(echo "$CURRENT_BRANCH" | sed 's|^\(feat\|fix\|refactor\|hotfix\|release\)/|\1/|')
EXISTING=$(git branch --list "${PREFIX}-t*" | sed 's/.*-t//' | sort -n | tail -1)
if [ -z "$EXISTING" ]; then
  NEXT_NUM=1
else
  NEXT_NUM=$((EXISTING + 1))
fi
NEW_BRANCH="${PREFIX}-t$(printf '%02d' $NEXT_NUM)"
```

### 5. 创建子分支

```bash
git checkout -b "$NEW_BRANCH"
```

### 6. 恢复 stash（如果有）

```bash
if [ "$STASH_NEEDED" = true ]; then
  git stash pop 2>/dev/null || true
fi
```

### 7. 输出结果

```
================================================================
 TASK BRANCH CREATED
================================================================
 父分支: feat/user-auth
 子分支: feat/user-auth-t01
 编号:   01

 下一步:
   /git:commit   — 在子分支上提交代码
   /git:finish   — 合并子分支到父分支
   /git:sync     — 从父分支同步最新代码
================================================================
```

## 错误处理

| 场景 | 处理 |
|------|------|
| 当前是子分支 | 拒绝创建，提示 "当前已在子分支 feat/xxx-t01 上。请先切回父分支 feat/xxx" |
| 当前是 develop/master | 拒绝创建，提示 "请先切换到集成分支 (feat/fix 等)" |
| 子分支已存在 | 自动递增编号 |
| 有未提交更改 | 自动 stash，创建后 pop |

## 相关命令

- [/git:finish](./finish) — 合并子分支到父分支
- [/git:sync](./sync) — 从父分支同步代码
- [/git:status](./status) — 查看父子分支状态
- [/git:commit](./commit) — 智能提交

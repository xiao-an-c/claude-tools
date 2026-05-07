---
name: git:sync
description: 同步代码（子分支从父分支，集成分支从 develop/master）
allowed-tools: [Bash]
---

# /git:sync — 同步代码

同步基础分支的最新代码到当前分支。支持子分支从父分支同步。

## 用法

```bash
/git:sync
```

## 子分支检测

解析当前分支名，检测是否匹配子分支模式：`^(feat|fix|refactor|hotfix|release)/(.+)-t\d+$`

## 同步目标

| 当前分支类型 | 同步目标 |
|-------------|---------|
| 子分支（`-t\d+` 后缀） | 从父分支 merge（本地） |
| feat/*, fix/*, refactor/* | `origin/develop` |
| hotfix/*, release/* | `origin/master` |
| develop, master | 无需同步 |

## 执行流程

### 1. 获取当前分支名

```bash
CURRENT_BRANCH=$(git branch --show-current)
```

### 2. 检测分支类型和同步目标

```bash
if [[ "$CURRENT_BRANCH" =~ ^(feat|fix|refactor|hotfix|release)/(.+)-t[0-9]+$ ]]; then
  SYNC_TARGET="${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
  SYNC_TYPE="parent"
elif [[ "$CURRENT_BRANCH" =~ ^(feat|fix|refactor)/ ]]; then
  SYNC_TARGET="origin/develop"
  SYNC_TYPE="remote"
elif [[ "$CURRENT_BRANCH" =~ ^(hotfix|release)/ ]]; then
  SYNC_TARGET="origin/master"
  SYNC_TYPE="remote"
else
  echo "当前分支无需同步"
  exit 0
fi
```

### 3. 检查未提交更改

如果有未提交更改，先 stash。

### 4. 执行同步

#### 子分支同步（从父分支）

```bash
git merge "$SYNC_TARGET" -m "Sync from $SYNC_TARGET"
```

**子分支不需要 fetch**，因为父分支是本地的。

#### 普通分支同步（从远程）

```bash
git fetch origin
git merge "$SYNC_TARGET"
```

### 5. 恢复 stash（如果有）

### 6. 冲突处理

如果合并出现冲突：

```
❌ 合并冲突！请手动解决：

1. 查看冲突文件: git status
2. 编辑冲突文件解决冲突
3. 标记已解决: git add [file]
4. 完成合并: git commit
```

### 7. 输出结果

**子分支同步：**
```
✅ 已同步父分支 `feat/user-auth` 到 `feat/user-auth-t01`
📌 当前分支: feat/user-auth-t01
📊 同步来源: feat/user-auth (本地)
```

**普通分支同步：**
```
✅ 已同步 `origin/develop` 到当前分支
📌 当前分支: feat/user-profile
📊 基础分支: develop
```

## 相关命令

- [/git:start-task](./start-task) - 创建任务子分支
- [/git:commit](./commit) - 智能提交
- [/git:finish](./finish) - 完成并合并分支

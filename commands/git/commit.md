---
name: git:commit
description: 智能提交，根据分支类型自动添加 commit 前缀（支持子分支）
allowed-tools: [Bash, AskUserQuestion]
---

# /git:commit — 智能提交

根据分支类型自动添加 commit 前缀。支持子分支。

## 用法

```bash
/git:commit [message]
```

## 子分支检测

解析当前分支名，检测是否匹配子分支模式：`^(feat|fix|refactor|hotfix|release)/(.+)-t\d+$`

子分支使用与父分支相同的 commit prefix。通过提取分支类型部分确定 prefix。

## 分支类型与 commit 前缀

| 分支类型 | commit 格式 |
|----------|-------------|
| feat/* (含子分支 feat/*-t*) | `feat(scope): [message]` |
| fix/* (含子分支 fix/*-t*) | `fix(scope): [message]` |
| refactor/* (含子分支 refactor/*-t*) | `refactor(scope): [message]` |
| hotfix/* (含子分支 hotfix/*-t*) | `fix(scope): [紧急] [message]` |
| release/* | `chore(release): [message]` |
| develop | `chore: [message]` |
| master | 禁止直接提交 |

**子分支规则：** `feat/user-auth-t01` 提取类型 `feat` → 使用 `feat(scope):` prefix。与父分支 `feat/user-auth` 使用相同的 prefix。

## Scope 推断规则

根据修改的文件路径自动推断 scope：

| 文件路径 | scope |
|----------|-------|
| src/views/* | 页面名 |
| src/api/* | api |
| src/components/* | 组件名 |
| src/utils/* | utils |
| src/store/* | store |

## 执行流程

### 1. 获取当前分支名

```bash
CURRENT_BRANCH=$(git branch --show-current)
```

### 2. 提取分支类型（支持子分支）

```bash
# 提取类型前缀，支持子分支的 -tNN 后缀
if [[ "$CURRENT_BRANCH" =~ ^(feat|fix|refactor|hotfix|release)/ ]]; then
  BRANCH_TYPE=$(echo "$CURRENT_BRANCH" | sed 's|/.*||')
fi
```

### 3. 如果在 master 分支，拒绝提交并提示

### 4. 分析 git diff --stat 获取修改范围作为 scope

### 5. 如果用户提供了 message，使用它；否则分析更改自动生成

### 6. 构建完整的 commit 信息并执行

## 输出示例

**子分支提交：**
```
✅ 提交成功: `feat(user): 添加登录页面`
📊 当前分支: feat/user-auth-t01 (子分支)
💡 提示: 使用 /git:sync 从父分支同步，或 /git:finish 完成任务
```

**普通分支提交：**
```
✅ 提交成功: `feat(user): 添加用户资料页面`
📊 当前分支: feat/user-profile
💡 提示: 使用 /git:sync 同步基础分支，或 /git:finish 完成开发
```

## 相关命令

- [/git:start-task](./start-task) - 创建任务子分支
- [/git:sync](./sync) - 同步代码
- [/git:finish](./finish) - 完成并合并分支

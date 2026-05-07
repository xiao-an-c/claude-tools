---
name: git:finish
description: 完成当前工作，合并分支到目标分支（支持子分支合并到父分支）
allowed-tools:
  - Bash
  - AskUserQuestion
---

# /git:finish — 完成工作，合并分支

完成当前工作，合并分支到目标分支。支持子分支合并到父分支。

## 用法

```bash
/git:finish
```

## 子分支检测

解析当前分支名，检测是否匹配子分支模式：`^(feat|fix|refactor|hotfix|release)/(.+)-t\d+$`

- 匹配 → 子分支，提取父分支名（去掉 `-t\d+` 后缀）
- 不匹配 → 普通集成分支

## 合并规则

| 分支类型 | 合并目标 |
|---------|---------|
| 子分支（`-t\d+` 后缀） | 合并到父分支 `--no-ff`，删除子分支 |
| feat/fix/refactor（无 `-t` 后缀） | 合并到 develop |
| hotfix（无 `-t` 后缀） | 合并到 master（打 tag）+ develop |
| release（无 `-t` 后缀） | 提示使用 /git:publish |
| develop/master | 禁止操作 |

## 执行流程

### 1. 获取当前分支名和类型

```bash
CURRENT_BRANCH=$(git branch --show-current)
```

### 2. 检测是否为子分支

```bash
if [[ "$CURRENT_BRANCH" =~ ^(feat|fix|refactor|hotfix|release)/(.+)-t[0-9]+$ ]]; then
  BRANCH_TYPE="sub"
  BRANCH_PREFIX="${BASH_REMATCH[1]}"
  PARENT_BRANCH="${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
else
  BRANCH_TYPE="integration"
fi
```

### 3. 检查未提交的更改

如果有未提交更改，提示用户先提交或 stash。

### 4. 根据分支类型执行合并

#### 子分支合并

```bash
# 切换到父分支
git checkout "$PARENT_BRANCH"

# 合并子分支
git merge "$CURRENT_BRANCH" --no-ff -m "Merge $CURRENT_BRANCH into $PARENT_BRANCH"

# 删除子分支
git branch -d "$CURRENT_BRANCH"
```

**注意：** 子分支合并不推送远程（子分支是本地的）。用户需要在父分支上手动 `/git:sync` 同步 develop，或最终 `/git:finish` 合并到 develop。

#### feat/fix/refactor 分支合并

```bash
git checkout develop
git pull origin develop
git merge "$CURRENT_BRANCH" --no-ff -m "Merge $CURRENT_BRANCH into develop"
git push origin develop
```

#### hotfix 分支合并

```bash
# 1. 合并到 master
git checkout master
git pull origin master
git merge "$CURRENT_BRANCH" --no-ff -m "Merge $CURRENT_BRANCH into master (hotfix)"

# 2. 打 tag
git tag -a "v[version]" -m "Hotfix v[version]"

# 3. 推送 master 和 tags
git push origin master --tags

# 4. 同步到 develop
git checkout develop
git pull origin develop
git merge "$CURRENT_BRANCH" --no-ff -m "Merge $CURRENT_BRANCH into develop (hotfix sync)"
git push origin develop
```

### 5. 询问是否删除当前分支

仅对集成分支询问。子分支已自动删除。

### 6. 输出结果

**子分支完成：**
```
================================================================
 TASK BRANCH MERGED
================================================================
 子分支: feat/user-auth-t01
 父分支: feat/user-auth
 合并方式: --no-ff
 子分支: 已删除

 下一步:
   /git:start-task — 创建下一个任务分支
   /git:status     — 查看父分支状态
   /git:finish     — 完成父分支（合并到 develop）
================================================================
```

**集成分支完成（同原逻辑）：**
```
================================================================
 MERGE COMPLETE
================================================================
 分支: feat/user-auth → develop
 合并方式: --no-ff
 分支清理: 已删除

 下一步:
   检查 CI/CD 状态
   通知团队成员拉取最新代码
================================================================
```

## 冲突处理

如果合并出现冲突：

1. 停止并提示手动解决
2. 列出冲突文件
3. 提供解决步骤

## 相关命令

- [/git:start-task](./start-task) - 创建任务子分支
- [/git:commit](./commit) - 智能提交
- [/git:sync](./sync) - 同步代码
- [/git:publish](./publish) - 发布 release 分支
- [/git:abort](./abort) - 放弃当前分支

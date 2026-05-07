# Git 命令

基于 Git Flow 的分支管理命令集，支持 Epic Branching（父子分支）模式。

## 分支生命周期

```
子分支 (feat/*-t01) → 集成分支 (feat/*) → develop → release → master
                                                            ↑
                                                      hotfix (紧急)
```

## 子分支命名规则

子分支格式：`<type>/<parent-slug>-t<NN>`

```
feat/user-auth          ← 集成分支（父分支）
  feat/user-auth-t01    ← 任务子分支 1
  feat/user-auth-t02    ← 任务子分支 2
```

父子关系通过命名规则检测：`^(feat|fix|refactor|hotfix|release)/(.+)-t\d+$`

## 命令分类

### 初始化

| 命令 | 说明 |
|------|------|
| [/git:init](./init) | 初始化项目 Git 分支规范 |

### 开始工作

| 命令 | 说明 |
|------|------|
| [/git:start-feat](./start-feat) | 从 develop 创建功能分支 |
| [/git:start-fix](./start-fix) | 从 develop 创建修复分支 |
| [/git:start-refactor](./start-refactor) | 从 develop 创建重构分支 |
| [/git:start-hotfix](./start-hotfix) | 从 master 创建紧急修复分支 |
| [/git:start-release](./start-release) | 创建发布分支 |
| [/git:start-task](./start-task) | **从当前分支创建任务子分支** |

### 日常工作

| 命令 | 说明 |
|------|------|
| [/git:commit](./commit) | 智能提交，自动添加前缀（支持子分支） |
| [/git:sync](./sync) | 同步代码（子分支从父分支，集成分支从 develop） |
| [/git:wip](./wip) | 保存工作进度 |
| [/git:status](./status) | 查看分支状态和子分支列表 |

### 完成工作

| 命令 | 说明 |
|------|------|
| [/git:finish](./finish) | 完成并合并分支（子分支→父分支，集成分支→develop） |
| [/git:publish](./publish) | 发布到 master |
| [/git:abort](./abort) | 放弃当前分支 |

## 快速参考

```bash
# 多任务功能开发（Epic Branching）
/git:start-feat user-auth        # 创建集成分支
/git:start-task login-page       # 创建任务子分支 feat/user-auth-t01
/git:commit "实现登录页面"        # 提交
/git:finish                      # 合并子分支到父分支

/git:start-task auth-service     # 创建下一个任务子分支
/git:commit "实现认证服务"
/git:finish                      # 合并子分支到父分支

/git:finish                      # 合并集成分支到 develop

# 简单开发流程
/git:start-feat [description]    # 开始功能
/git:commit [message]            # 提交代码
/git:finish                      # 完成合并

# 发布流程
/git:start-release v1.0.0        # 创建发布分支
/git:publish                     # 发布到 master

# 紧急修复
/git:start-hotfix [description]  # 开始紧急修复
/git:finish                      # 完成（自动合并到 master + develop）
```

## 相关文档

- [Git 分支规范](/specs/git-branch-spec) - 详细的分支管理规范

# Git 命令

基于 Git Flow 的分支管理命令集。

## 分支生命周期

```
feat/fix/refactor → develop → release → master
                                    ↑
                              hotfix（紧急）
```

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

### 日常工作

| 命令 | 说明 |
|------|------|
| [/git:commit](./commit) | 智能提交，自动添加前缀 |
| [/git:sync](./sync) | 同步基础分支代码 |
| [/git:wip](./wip) | 保存工作进度 |
| [/git:status](./status) | 查看分支状态和建议 |

### 完成工作

| 命令 | 说明 |
|------|------|
| [/git:finish](./finish) | 完成并合并分支 |
| [/git:publish](./publish) | 发布到 master |
| [/git:abort](./abort) | 放弃当前分支 |

## 快速参考

```bash
# 日常开发流程
/git:start-feat [description]  # 开始功能
/git:commit [message]          # 提交代码
/git:finish                    # 完成合并

# 发布流程
/git:start-release v1.0.0      # 创建发布分支
/git:publish                   # 发布到 master

# 紧急修复
/git:start-hotfix [description] # 开始紧急修复
/git:finish                     # 完成（自动合并到 master + develop）
```

## 相关文档

- [Git 分支规范](/specs/git-branch-spec) - 详细的分支管理规范

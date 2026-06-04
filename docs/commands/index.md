# 命令概览

Claude Tools 提供多种命令类别，按需安装使用。

## 可用类别

### [git] Git 工作流命令

基于 Git Flow 的分支管理命令集，提供完整的开发、测试、发布流程。

| 命令 | 用途 |
|------|------|
| `git-flow init` | 初始化 Git 分支规范 |
| `git-flow start-feat` | 开始新功能开发 |
| `git-flow start-fix` | 开始 Bug 修复 |
| `git-flow start-refactor` | 开始代码重构 |
| `git-flow start-hotfix` | 开始紧急修复 |
| `git-flow start-release` | 创建发布分支 |
| `git-flow start-task` | 从当前分支创建任务子分支 |
| `git-flow commit` | 智能提交（自动前缀） |
| `git-flow sync` | 同步基础分支代码 |
| `git-flow wip` | 保存工作进度 |
| `git-flow status` | 查看分支状态和建议 |
| `git-flow finish` | 完成并合并分支 |
| `git-flow publish` | 发布到 master |
| `git-flow abort` | 放弃当前分支 |

[查看 Git 命令详情](/commands/git/)

### [dev] 开发工作流命令

场景驱动的多 Agent 协作开发工作流。工作流定义存储在 `.dev/workflows/` 中，通过 `dev-flow run` 通用执行器调用：

| 命令 | 用途 |
|------|------|
| `dev-flow run patch <描述>` | 超轻量补丁（零 git 零文档） |
| `dev-flow run fix <描述>` | Bug 诊断 + 修复 |
| `dev-flow run feat <描述>` | 新功能开发（自适应复杂度） |
| `dev-flow run refactor <描述>` | 代码重构 |
| `dev-flow run hotfix <描述>` | 线上紧急修复 |
| `dev-flow run auto <描述>` | 即兴编排（不匹配预设模式时） |
| `dev-flow review` | 代码审查（只读） |
| `dev-flow discuss` | 架构讨论（只读） |
| `dev-flow investigate` | Bug 排查（只读） |
| `dev-flow status` | 查看工作流状态和进度 |
| `dev-flow resume` | 恢复中断的工作流 |

[查看 Dev 命令详情](/commands/dev/)

## 快速参考

### 日常开发

```bash
git-flow start-feat user-profile     # 开始功能
# ... 编写代码 ...
git-flow commit 添加用户资料页面      # 智能提交
git-flow sync                        # 同步基础分支
git-flow finish                      # 完成合并
```

### 发布流程

```bash
git-flow start-release v1.0.0        # 创建发布分支
# ... 测试修复 ...
git-flow publish                     # 发布到 master 并同步 develop
```

### 紧急修复

```bash
git-flow start-hotfix payment-crash  # 从 master 创建
# ... 修复代码 ...
git-flow finish                      # 自动合并 master + develop
```

### 多 Agent 开发工作流

```bash
dev-flow run feat 添加用户登录功能     # 新功能开发
dev-flow run fix 登录后白屏            # Bug 修复模式
dev-flow run patch 修个 typo           # 超轻量补丁
dev-flow run hotfix 线上支付失败       # 紧急修复
dev-flow run refactor 重构工具函数     # 代码重构
dev-flow run auto 迁移到 TypeScript    # 即兴编排
dev-flow status                       # 查看进度
dev-flow resume                       # 恢复中断的工作流
```

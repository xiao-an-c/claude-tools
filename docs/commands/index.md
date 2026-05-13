# 命令概览

Claude Tools 提供多种命令类别，按需安装使用。

## 可用类别

### [git] Git 工作流命令

基于 Git Flow 的分支管理命令集，提供完整的开发、测试、发布流程。

| 命令 | 用途 |
|------|------|
| `/git:init` | 初始化 Git 分支规范 |
| `/git:start-feat` | 开始新功能开发 |
| `/git:start-fix` | 开始 Bug 修复 |
| `/git:start-refactor` | 开始代码重构 |
| `/git:start-hotfix` | 开始紧急修复 |
| `/git:start-release` | 创建发布分支 |
| `/git:commit` | 智能提交（自动前缀） |
| `/git:sync` | 同步基础分支代码 |
| `/git:wip` | 保存工作进度 |
| `/git:status` | 查看分支状态和建议 |
| `/git:finish` | 完成并合并分支 |
| `/git:publish` | 发布到 master |
| `/git:abort` | 放弃当前分支 |

[查看 Git 命令详情](/commands/git/)

### [test] 测试辅助命令

基于 AAA 模式的单元测试辅助命令集。

| 命令 | 用途 |
|------|------|
| `/test:generate` | 为模块生成单元测试 |
| `/test:snapshot` | 生成快照测试 |
| `/test:review` | 审查测试质量 |
| `/test:coverage` | 分析测试覆盖率 |

[查看 Test 命令详情](/commands/test/)

### [dev] 开发工作流命令

场景驱动的多 Agent 协作开发工作流。工作流定义存储在 `.dev/workflows/` 中，路由器自动识别场景并匹配工作流，由通用执行器 `/dev:run` 机械执行：

| 命令 | 用途 |
|------|------|
| `/dev:start` | 路由器入口，匹配工作流并执行 |
| `/dev:start --run <name>` | 执行指定工作流 |
| `/dev:start --list` | 列出所有可用工作流 |
| `/dev:feat` | 新功能开发（完整团队协作） |
| `/dev:fix` | Bug 诊断 + 修复 |
| `/dev:refactor` | 代码重构 |
| `/dev:patch` | 超轻量补丁（零 git 零文档） |
| `/dev:hotfix` | 线上紧急修复 |
| `/dev:review` | 代码审查（只读） |
| `/dev:discuss` | 架构讨论（只读） |
| `/dev:investigate` | Bug 排查（只读） |
| `/dev:auto` | 即兴编排（不匹配预设模式时） |
| `/dev:status` | 查看工作流状态和进度 |
| `/dev:resume` | 恢复中断的工作流 |

[查看 Dev 命令详情](/commands/dev/)

## 快速参考

### 日常开发

```bash
/git:start-feat user-profile     # 开始功能
# ... 编写代码 ...
/git:commit 添加用户资料页面      # 智能提交
/git:sync                        # 同步基础分支
/git:finish                      # 完成合并
```

### 发布流程

```bash
/git:start-release v1.0.0        # 创建发布分支
# ... 测试修复 ...
/git:publish                     # 发布到 master 并同步 develop
```

### 紧急修复

```bash
/git:start-hotfix payment-crash  # 从 master 创建
# ... 修复代码 ...
/git:finish                      # 自动合并 master + develop
```

### 测试辅助

```bash
/test:generate src/utils/parser.ts   # 生成单元测试
/test:review tests/parser.test.ts    # 审查测试质量
/test:coverage                       # 分析覆盖率

### 多 Agent 开发工作流

```bash
/dev:start 添加用户登录功能    # 路由器自动选择模式
/dev:feat 添加用户登录功能     # 手动指定新功能模式
/dev:fix 登录后白屏            # Bug 修复模式
/dev:patch 修个 typo           # 超轻量补丁
/dev:status                    # 查看进度
/dev:resume                    # 恢复中断的工作流
```

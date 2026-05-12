# [dev] 开发工作流命令

场景驱动的多 Agent 协作开发工作流。每个命令对应一个真实的开发场景。

## 命令总览

### 路由器

| 命令 | 用途 |
|------|------|
| `/dev:start [描述]` | 自动识别场景，分发到对应模式 |
| `/dev:start --<mode> [描述]` | 手动指定模式（patch/fix/feat/refactor/hotfix/review/discuss/investigate） |

### 代码修改模式

| 命令 | 场景 | Agent | Git | 文档 |
|------|------|-------|-----|------|
| `/dev:patch <改动>` | 小修小补，已知原因 | architect + developer | 无 | 无 |
| `/dev:fix <问题>` | Bug 修复，需诊断 | architect + developer | `fix/*` | PRD, ACCEPTANCE |
| `/dev:feat <功能>` | 新功能开发 | product + tester + architect + planner + developer(s) | `feat/*` | 全套 |
| `/dev:refactor <描述>` | 代码重构 | architect + planner + developer(s) | `refactor/*` | ARCH, PLAN, ACCEPTANCE |
| `/dev:hotfix <问题>` | 线上紧急修复 | architect + developer | `hotfix/*` | ACCEPTANCE |

### 只读模式

| 命令 | 场景 | Agent | 产出 |
|------|------|-------|------|
| `/dev:review <目标>` | 代码审查 | architect | REVIEW.md |
| `/dev:discuss <主题>` | 架构讨论/开会 | product + architect | MINUTES.md |
| `/dev:investigate <问题>` | Bug 排查 | architect | INVESTIGATION.md |

### 辅助命令

| 命令 | 用途 |
|------|------|
| `/dev:status` | 查看当前工作流状态 |
| `/dev:resume` | 恢复中断的工作流 |

## 所有模式通用参数

| 参数 | 说明 |
|------|------|
| `--git` | 强制使用 git（创建分支） |
| `--no-git` | 跳过 git，在当前分支工作 |

## 模式衔接

只读模式产出分析文档，自然衔接到代码修改模式：

```
/dev:investigate 排查bug → 建议用 /dev:fix 修复
/dev:discuss 讨论方案 → 建议用 /dev:feat 实现
/dev:review 审查代码 → 建议用 /dev:refactor 改进
```

## 工作流程

```
/dev:start <描述>
    ↓
路由器自动检测 → 分发到模式命令
    ↓
    ┌─────────┬──────────┬───────────┬──────────┐
    │ patch   │ fix      │ feat      │ refactor │
    │ 2 min   │ 5-10 min │ 15-45 min │ 10-30min │
    └─────────┴──────────┴───────────┴──────────┘
    ↓
用户自行 /git:finish 合并分支（如果使用了 git）
```

## Agent 团队

| Agent | 模型 | 职责 | 使用的模式 |
|-------|------|------|-----------|
| dev-product | opus | 需求讨论、PRD 输出 | feat, discuss |
| dev-architect | opus | 架构设计、代码诊断、审查 | 全部模式 |
| dev-planner | opus | 任务分解 | feat, refactor |
| dev-tech-designer | sonnet | 详细技术方案 | feat (复杂) |
| dev-developer | sonnet | 代码实现 | patch, fix, feat, refactor, hotfix |
| dev-tester | sonnet | 测试设计 | feat |
| dev-recorder | sonnet | 知识记录（显式触发） | 全部模式 |

## 知识库

项目知识积累在 `docs/knowledge/` 下：

- `architecture.md` — 架构决策
- `conventions.md` — 编码规范
- `gotchas.md` — 重复陷阱
- `domain.md` — 业务核心
- `methodology.md` — 方法论

每次工作流完成后，recorder 严格过滤后记录高价值发现（宁可漏记，不要噪音）。

## 相关命令

- [/git:start-feat](../git/start-feat) - 手动创建功能分支
- [/git:commit](../git/commit) - 智能提交
- [/git:finish](../git/finish) - 完成并合并分支
- [/test:generate](../test/generate) - 手动生成测试

# [dev] 开发工作流命令

多 Agent 协作开发工作流命令集，自动评估复杂度，按 Quick/Standard/Full 三级流程执行。

## 可用命令

| 命令 | 用途 |
|------|------|
| `/dev:start [--quick\|--standard\|--full] [描述]` | 启动开发工作流（自动评估级别，或手动指定） |
| `/dev:status` | 查看当前工作流状态、级别和进度 |
| `/dev:resume` | 恢复中断的工作流 |

## 工作流级别

| 级别 | 适用场景 | 流程 | Agent 数 |
|------|---------|------|---------|
| **Quick** | hotfix、单文件修改、紧急修复 | Product → 开发 → 验证 → 验收 | 2 |
| **Standard** | fix、小功能、refactor | Product → 测试+架构 → 规划 → 开发 → 验证 → 验收 | 5 |
| **Full** | 大型功能、跨模块、新模块 | 完整流程 | 7 |

不指定级别时，在 Product 阶段后自动评估复杂度选择最合适的级别。

## 工作流程

```
/dev:start [--quick|--standard|--full] <功能描述>
    ↓
1. 创建分支 (feat/fix/refactor/hotfix/release) + GitFlow 策略
    ↓
2. 产品讨论 → dev-product Agent（与用户交互，输出 PRD）
    ↓
3. 复杂度评估 → 自动选择 Quick/Standard/Full
    ↓
   ┌──────────────────┬──────────────────────┬──────────────────────┐
   │ Quick            │ Standard             │ Full                 │
   │ 开发 → 验收      │ 测试+架构 → 规划     │ 测试+架构 → 自审     │
   │                  │ → 开发 → 验收        │ → 规划 → 技术设计    │
   │                  │                      │ → 开发 → 验收        │
   └──────────────────┴──────────────────────┴──────────────────────┘
    ↓
用户自行 /git:finish 合并分支
```

## GitFlow 分支策略

| 分支类型 | base_branch | 合并目标 |
|---------|-------------|---------|
| `hotfix/*` | main/master | main + develop |
| `release/*` | develop | main + develop |
| `fix/*` | develop | develop |
| `refactor/*` | develop | develop |
| `feat/*` | develop | develop |

## 子分支（Epic Branching）

Standard/Full 级别支持子分支，命名规则 `<type>/<slug>-t<NN>`：

```
feat/user-auth          ← 集成分支
  feat/user-auth-t01    ← 子分支（任务 1）
  feat/user-auth-t02    ← 子分支（任务 2）
```

子分支由 dev workflow 自动创建，验证通过后合并回集成分支。
Git 命令（`/git:start-task`、`/git:finish` 等）独立支持此命名规则。

## Agent 列表

| Agent | 模型 | 职责 | Quick | Standard | Full |
|-------|------|------|-------|----------|------|
| dev-product | opus | 需求讨论、PRD 输出 | ✅ | ✅ | ✅ |
| dev-tester | sonnet | 测试用例设计、测试执行 | ❌ | ✅ | ✅ |
| dev-architect | opus | 高层架构设计、模块划分 | ❌ | ✅ | ✅ |
| dev-planner | opus | 任务分解、build/test 配置发现 | ❌ | ✅ | ✅ |
| dev-tech-designer | sonnet | 详细技术实现方案 | ❌ | ❌ | ✅ |
| dev-developer | sonnet | 代码实现、提交 | ✅ | ✅ | ✅ |
| dev-recorder | sonnet | 经验记录（后台） | ❌ | ❌ | ✅ |

## 产物文件

每次工作流生成在 `.dev/plan/<branch-name>/` 下：

`PRD.md` → `TEST-DESIGN.md` → `ARCHITECTURE.md` → `PLAN.md` → `TECH-DESIGN.md` → `TASK-LOG.md` → `ACCEPTANCE.md`

（Quick 级别只生成 PRD.md、TASK-LOG.md、ACCEPTANCE.md）

## 相关命令

- [/git:start-feat](../git/start-feat) - 手动创建功能分支
- [/git:commit](../git/commit) - 智能提交
- [/git:finish](../git/finish) - 完成并合并分支
- [/test:generate](../test/generate) - 手动生成测试

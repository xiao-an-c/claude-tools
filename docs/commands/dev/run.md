# /dev:run

通用工作流执行器。读取工作流定义文件，机械执行每个步骤。

## 用法

```bash
/dev:run <workflow-name> [--git|--no-git] <描述>
```

## 参数

| 参数 | 说明 |
|------|------|
| `workflow-name` | 工作流名称，对应 `.dev/workflows/` 下的文件名（不含 `.md`） |
| `--git` | 强制使用 git（创建分支） |
| `--no-git` | 跳过 git，在当前分支工作 |
| `描述` | 任务描述，传给工作流中的变量 |

## 内置工作流

| 名称 | 用途 | 步骤 |
|------|------|------|
| `patch` | 小修小补，已知原因 | 4 |
| `fix` | Bug 修复，需诊断 | 10 |
| `feat` | 新功能开发 | 13 |
| `refactor` | 代码重构 | 11 |
| `hotfix` | 线上紧急修复 | 8 |
| `auto` | 即兴编排，动态设计 | 6 |

## 执行流程

```
/dev:run feat 添加用户登录功能
    ↓
1. 加载工作流定义
   优先 .dev/workflows/feat.md，不存在则用包内置的 workflows/feat.md
    ↓
2. 解析 YAML frontmatter（defaults、步骤定义）
    ↓
3. 机械执行步骤
   builtin → 内置动作（创建分支、初始化状态等）
   agent   → spawn Agent（架构师、开发者等）
   loop    → 循环子步骤（逐任务开发）
   condition → 条件执行（仅复杂模式）
    ↓
4. 产出状态文件 + 验收说明书
```

## 步骤类型

### builtin

执行器内置动作，工作流中定义的 bash 脚本直接执行：

| 动作 | 说明 |
|------|------|
| `parse_arguments` | 解析标志和描述，生成 slug |
| `create_branch` | 创建 git 分支 |
| `init_state` | 创建 `.dev/plan/` 目录，写入 config.yml |
| `human_confirmation` | AskUserQuestion 展示信息，用户确认 |
| `verify` | 运行验证命令 |
| `generate_acceptance` | 生成 ACCEPTANCE.md |
| `display_summary` | 输出总结 |
| `evaluate_complexity` | 评估复杂度，决定是否启用子分支 |

### agent

spawn Agent，将 prompt 模板中的 `${variable}` 替换为运行时值：

```
Agent(
  subagent_type="dev-architect",
  model="opus",
  prompt="..."
)
```

- 有 `parallel_with` 时同时 spawn 多个 agent
- 收集返回值，更新 TASK-LOG.md

### loop

读取循环源（如 PLAN.md 中的任务列表），对每个项执行子步骤。上下文超过 60% 时建议 `/dev:resume`。

### condition

评估条件表达式，满足则执行子步骤，不满足则跳过。

## 人类门控

步骤标记 `Human_gate: true` 时，用 AskUserQuestion 展示信息供用户确认/调整/取消。

## 沉淀工作流（仅 auto 模式）

如果工作流是动态设计的且执行成功：

```
AskUserQuestion: "要保存为可复用的模板吗？"
  → 保存: 输入名称 → 写入 .dev/workflows/<name>.md
  → 跳过: 结束
```

## 错误处理

- **Agent spawn 失败**：重试 1 次，仍然失败则报告用户
- **验证失败**：按工作流 Retry 配置重试，耗尽后记录 FAILED
- **上下文 > 60%**：输出进度摘要，建议 `/dev:resume`

## 自定义工作流

在项目的 `.dev/workflows/` 目录下创建 `<name>.md` 文件，按照内置工作流的格式编写，即可通过 `/dev:run <name>` 调用。自定义工作流优先于内置工作流。

## 相关命令

- [/dev:status](./status) -- 查看工作流状态
- [/dev:resume](./resume) -- 恢复中断的工作流
- [/dev:review](./review) -- 代码审查（独立命令）
- [/dev:discuss](./discuss) -- 架构讨论（独立命令）
- [/dev:investigate](./investigate) -- Bug 排查（独立命令）

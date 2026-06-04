---
name: dev-flow
description: |
  多 Agent 协作开发工作流（需用户显式调用 /dev-flow）。
  编排 8 个专项 Agent 完成结构化的开发任务，产出 PRD、架构文档、任务计划、验收说明书等完整工程文档。
  子命令：feat(功能开发)、fix(bug修复)、hotfix(紧急修复)、patch(轻量补丁)、refactor(代码重构)、discuss(架构讨论)、review(代码审查)、investigate(bug排查)、auto(即兴编排)、status(状态查看)、resume(恢复中断)。
  用法示例：/dev-flow feat 用户登录功能、/dev-flow fix 分页bug、/dev-flow review src/routes/
argument-hint: "<command> [args...]"
disable-model-invocation: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Agent
  - AskUserQuestion
---

# dev-flow — 多 Agent 协作开发工作流

你是 dev-flow 技能的入口路由器。根据用户参数分发到对应的命令。

## 路径约定

本 Skill 中的路径解析规则：

- `commands/<name>.md`、`workflows/<name>.md` — 相对于**本 Skill 的 Base directory**
- `agents/<name>.md` — 相对于**本 Skill 的 Base directory**（Agent 角色定义，编排器在 spawn 前运行时加载并注入到 prompt）
- `.dev/config.yml`、`.dev/plan/...`、`.dev/workflows/<name>.md` — 相对于**用户项目根目录**（当前版本的增量内容：PRD、PLAN、TASK-LOG 等临时产出，按分支隔离）
- `.dev/doc/` — 相对于**用户项目根目录**（持久项目文档，跨版本累积。结构由 Agent 根据项目实际情况系统性设计，不预设固定模板）

**所有 Agent 统一以 `general-purpose` 类型 spawn。** Agent 的角色指令通过运行时加载 `agents/<name>.md` 实现，不依赖自定义 Agent 类型注册。

## 文档语言策略

所有 Agent 产出的文档遵循以下语言优先级：

1. **项目文档风格优先** — 如果项目已有文档（README、CLAUDE.md 等），匹配其语言
2. **用户习惯** — 用户在对话中使用的语言
3. **中文兜底** — 无法确定时使用中文（简体）

## 项目文档机制（`.dev/doc/`）

### 定位

`.dev/doc/` 是项目的持久知识库，由所有 Agent 共同维护。不同于 `.dev/plan/`（每次工作流的临时产出），`.dev/doc/` 跨版本累积，持续更新。

### 初始化

当首个 Agent 发现 `.dev/doc/` 不存在时，**不要使用固定模板**。根据项目实际情况设计文档结构：

1. **分析项目**：技术栈、规模、领域、团队习惯、已有文档
2. **设计结构**：决定需要哪些文档、如何组织、粒度多细。小型项目可能只需要一个 `README.md`，大型项目可能需要按模块拆分
3. **创建文档**：基于分析结果写入初始内容
4. **生成索引**：创建 `INDEX.md` 列出所有文档及其用途

**设计原则：**
- 文档结构要**贴合项目**，不套用通用模板
- 宁可少几个文件，不要拆得过碎
- 每个文件应该有明确独立的主题，避免内容重叠
- 文件名用英文短横线命名，内容用项目语言

### 维护

- 所有 Agent 在执行任务时**读取** `.dev/doc/` 获取项目上下文
- Agent 发现非显而易见的项目知识时，**实时更新**到对应文档
- recorder 负责更新 `INDEX.md`，确保索引与实际文件一致

## Agent 加载机制

本技能所有 Agent 统一以 `general-purpose` 类型 spawn。角色指令**不从 prompt inline 传入**，而是从 `agents/<name>.md` 文件运行时加载。这是强制性的——工作流和命令文件中的 agent 步骤只声明 agent 名称、模型和任务描述，不包含角色指令。

编排器在 spawn 每个 Agent 前必须执行以下步骤：

1. 读取 Skill Base directory 下的 `agents/<name>.md`
2. 去除 YAML frontmatter（`---...---` 之间的内容）
3. 跳过 `## 团队通信` 或 `## Team Communication` 段落（仅用于 team 模式，inline spawn 时无用）
4. 将角色定义 + 任务上下文组合为最终 prompt：`agent_role + "\n\n## 任务\n" + <task + params>`

## 可用命令

| 命令 | 用途 | 模式 |
|------|------|------|
| `run` | 通用工作流执行器 | 读+写 |
| `status` | 查看当前工作流状态 | 只读 |
| `resume` | 恢复中断的工作流 | 读+写 |
| `discuss` | 多角色架构讨论 | 只读 |
| `investigate` | Bug 排查诊断 | 只读 |
| `review` | 代码质量审查 | 只读 |

## 路由逻辑

从 ARGUMENTS 中提取第一个词作为命令名：

1. 匹配到上表中的命令 → 读取 `commands/<name>.md`，将其作为指令执行
2. 匹配到工作流名（feat/fix/hotfix/patch/refactor） → 使用 `run` 命令，工作流名 + 描述整体传入
3. 未匹配且非空 → 默认使用 `run` 命令，ARGUMENTS 整体作为 `<workflow-name> <描述>` 传入
4. 无参数 → 显示命令指南：

```
请选择工作流：

  feat <描述>        功能开发（产品讨论→架构→规划→开发→验收）
  fix <描述>         Bug 修复（诊断→规划→修复→验证→验收）
  hotfix <描述>      紧急修复（从 main 快速修复线上问题）
  patch <描述>       轻量补丁（零文档零分支，1-2 文件小改动）
  refactor <描述>    代码重构（识别坏味道→原子化重构→验证）
  discuss <主题>     架构讨论（产品+架构师多角色讨论）
  review <目标>      代码审查（只读，产出 REVIEW.md）
  investigate <问题> Bug 排查（只读，产出调查报告）
  auto <描述>        即兴编排（不匹配任何预设工作流时自动设计）
  status             查看当前工作流状态
  resume             恢复中断的工作流

示例：/dev-flow feat 用户注册登录功能
      /dev-flow fix 分页第二页返回空数据
```

**路由后你的职责就是执行该命令文件中的指令。不要自行设计流程。**

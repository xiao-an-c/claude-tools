---
name: dev_review
description: 代码审查模式（只读），架构师审查代码质量，产出 REVIEW.md
argument-hint: "<审查目标（文件路径/模块名/功能描述）>"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Agent
---

# /dev:review — 代码审查模式（只读）

架构师审查代码，发现问题，提供建议。不修改任何文件。

## 适用场景

- 想让架构师 review 一段代码
- 合并前想了解代码质量
- 想知道某个模块有什么问题

## 不适用

- 想直接改代码（用 `/dev:fix` 或 `/dev:refactor`）
- 想讨论方案（用 `/dev:discuss`）

## 流程

```
/dev:review src/components/Login.tsx
    ↓
Step 1: 解析审查目标
    ↓
Step 2: 架构师审查代码
    ↓
Step 3: 生成 REVIEW.md
    ↓
Step 4: Recorder（记录审查发现）
    ↓
Done. 建议 /dev:refactor 或 /dev:fix
```

## 执行步骤

### Step 1: 解析输入

提取审查目标。可以是：
- 文件路径：`src/components/Login.tsx`
- 模块名：`auth module`
- 功能描述：`登录相关的代码`

review 模式不使用 git、不创建分支。

### Step 2: 架构师审查

以内联方式 spawn dev-architect，只做审查：

```
Agent(
  subagent_type="dev-architect",
  model="opus",
  prompt="
    <review_target><审查目标></review_target>
    <project_root><项目根目录绝对路径></project_root>
    <knowledge_dir>docs/knowledge/</knowledge_dir>

    你正在审查代码。根据审查目标定位并阅读相关代码，然后输出审查报告。

    审查维度：
    1. **代码质量**: 命名、可读性、复杂度
    2. **设计问题**: 职责划分、耦合度、抽象层次
    3. **潜在 bug**: 边界条件、错误处理、并发问题
    4. **性能**: 明显的性能问题（N+1 查询、不必要的渲染等）
    5. **安全**: 注入、XSS、敏感数据暴露
    6. **可维护性**: 测试难度、修改风险

    输出格式（写入 .dev/review/REVIEW.md）：

    # 代码审查: <审查目标>

    ## 审查范围
    <审查了哪些文件>

    ## 总体评估
    <1-2 句话总结>

    ## 发现

    ### 🔴 严重问题（必须修复）
    <问题列表，包含文件路径和行号>

    ### 🟡 建议改进（推荐修复）
    <改进建议列表>

    ### 🟢 做得好的地方
    <值得保留的模式>

    ## 建议下一步
    - 如有严重问题: /dev:fix <问题描述>
    - 如有设计改进: /dev:refactor <重构建议>
    - 如整体OK: 可以合并

    注意：不要修改任何源代码文件。只读审查。
  "
)
```

### Step 3: 展示审查结果

读取 REVIEW.md，向用户展示关键发现。

### Step 4: Recorder

如果审查发现了值得记录的知识：

```
Agent(
  subagent_type="dev-recorder",
  model="sonnet",
  prompt="
    <knowledge_dir>docs/knowledge/</knowledge_dir>
    <phase>review</phase>
    <notes>
    <审查中的关键发现，如系统性问题、项目特有的代码模式问题等>
    </notes>
  "
)
```

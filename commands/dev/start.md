---
name: dev_start
description: 开发工作流路由器，自动识别场景并分发到对应模式命令
argument-hint: "[--patch|--fix|--feat|--refactor|--hotfix|--review|--discuss|--investigate] <描述>"
allowed-tools:
  - Read
  - Bash
  - Agent
  - AskUserQuestion
---

# /dev:start — 开发工作流路由器

根据你的描述，自动识别你在做什么，分发到对应的模式命令。你也可以直接调用具体模式。

## 可用模式

| 命令 | 场景 | 改代码 | Git |
|------|------|--------|-----|
| `/dev:patch` | 小修小补 | ✅ | 无 |
| `/dev:fix` | Bug 修复 | ✅ | `fix/*` |
| `/dev:feat` | 新功能 | ✅ | `feat/*` |
| `/dev:refactor` | 重构 | ✅ | `refactor/*` |
| `/dev:hotfix` | 线上紧急修复 | ✅ | `hotfix/*` |
| `/dev:review` | 代码审查 | ❌ | 无 |
| `/dev:discuss` | 架构讨论 | ❌ | 无 |
| `/dev:investigate` | Bug 排查 | ❌ | 无 |

所有模式都支持 `--git` / `--no-git` 参数控制 git 使用。

## 执行流程

### Step 1: 解析输入

```markdown
1. 提取显式模式标志（如果存在）：
   --patch / --fix / --feat / --refactor / --hotfix / --review / --discuss / --investigate
   → 如果有，直接使用该模式，跳过自动检测

2. 提取 --git / --no-git 标志

3. 从剩余文本中提取描述
   → 如果没有参数也没有标志，用 AskUserQuestion 询问用户
```

### Step 2: 自动检测模式（仅当未指定标志时）

**关键词评分表：**

```markdown
对描述文本逐词/短语匹配以下关键词，每个匹配加分。最终选分数最高的模式。

### /dev:patch（权重 3）
关键词: "patch", "typo", "config", "tweak", "一行", "改个", "修个"
附加条件: 描述 ≤10 字且无复杂信号词 → +1 分

### /dev:fix（权重 3）
关键词: "修复", "bug", "fix", "broken", "报错", "错误", "异常", "crash", "failure"
"doesn't work", "不工作", "不生效"

### /dev:feat（权重 3）
关键词: "添加", "新增", "实现", "feature", "新功能", "支持", "add", "create", "build"

### /dev:refactor（权重 3）
关键词: "重构", "refactor", "优化", "清理", "improve", "重命名", "提取", "合并", "拆分"

### /dev:hotfix（权重 5）
关键词: "紧急", "hotfix", "线上", "生产", "production", "宕机", "ASAP", "紧急修复"

### /dev:review（权重 3）
关键词: "review", "审查", "代码审查", "看看", "分析", "evaluate", "assess"

### /dev:discuss（权重 3）
关键词: "讨论", "discuss", "方案", "怎么实现", "怎么做", "brainstorm", "explore", "approach", "选型"

### /dev:investigate（权重 3）
关键词: "调查", "investigate", "为什么", "排查", "debug", "原因", "root cause", "trace"

无匹配 → 默认 /dev:feat
```

### Step 3: 显示检测结果 + 确认

```
AskUserQuestion(questions=[{
  header: "模式选择",
  multi_select: false,
  options: [
    { label: "确认", description: "使用 /dev:<mode>" },
    { label: "切换模式", description: "我想用其他模式" }
  ],
  question: "检测到模式: /dev:<mode>（依据: <匹配的关键词>）。确认？"
}])
```

如果用户选择切换，用 AskUserQuestion 展示所有模式供选择。

### Step 4: 执行模式

**不 spawn agent，不创建团队。** 直接告诉 Claude 执行对应模式文件的指令：

```markdown
检测到模式: <mode>
用户描述: <description>
git 参数: <use_git>

请按照 commands/dev/<mode>.md 中的指令执行。
```

**这意味着 Claude 会读取模式文件并按其中的步骤执行。** 路由器本身不包含任何 git 逻辑、agent spawn 逻辑或工作流步骤。

## 路由示例

| 输入 | 检测结果 | 依据 |
|------|---------|------|
| `修复登录页面在 Safari 下无法点击` | `/dev:fix` | "修复" |
| `添加用户个人资料编辑功能` | `/dev:feat` | "添加" |
| `重构认证模块，提取共享逻辑` | `/dev:refactor` | "重构" |
| `线上支付接口返回 500` | `/dev:hotfix` | "线上" + 高权重 |
| `改个 typo` | `/dev:patch` | "改个" + 短描述 |
| `审查 src/auth/ 的代码质量` | `/dev:review` | "审查" |
| `用户权限系统怎么设计` | `/dev:discuss` | "怎么设计" |
| `用户登录后偶尔被踢出` | `/dev:feat` | 无明确模式词 → 默认 feat |
| `排查用户登录后偶尔被踢出的原因` | `/dev:investigate` | "排查" |

# 扩展新类别

Claude Tools 支持扩展新的命令类别。你可以创建自定义命令集并贡献给社区。

## 创建新类别

### 1. 创建目录结构

在项目根目录的 `commands/` 下创建新的类别目录：

```
commands/
├── git/          # 现有 Git 命令
├── test/         # 现有 Test 命令
└── workflow/     # 新类别
    ├── review.md
    └── deploy.md
```

### 2. 创建命令文件

每个命令是一个 Markdown 文件，使用结构化格式编写：

```markdown
---
name: workflow:review
description: 代码审查命令
allowed-tools:
  - Bash
  - AskUserQuestion
---

<objective>
执行代码审查流程
</objective>

<rules>
- 只审查暂存的变更（staged changes）
- 不审查 package-lock.json 等自动生成文件
- 每个问题必须标注文件路径和行号
</rules>

<process>
1. 获取待审查的变更
2. 分析代码质量
3. 输出审查报告
</process>

<execution>
## 具体执行步骤

1. 运行 `git diff --cached` 获取暂存变更
2. 按文件类型分别检查：
   - TypeScript/JavaScript: 类型安全、错误处理
   - CSS/Tailwind: 样式规范、响应式
   - 配置文件: 格式正确性
3. 输出标记格式的审查报告
4. 询问用户是否修复发现的问题
</execution>
```

### 3. 注册新类别

在 `scripts/install.js` 或 `bin/cli.js` 的类别描述映射中添加：

```javascript
const categoryDescriptions = {
  git: 'Git 工作流命令',
  test: '测试辅助命令',
  workflow: '工作流命令'  // 新增
};
```

## 命令文件格式详解

### Frontmatter 字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | 是 | 命令名称，格式：`类别:命令`，如 `workflow:review` |
| `description` | 是 | 简短描述，显示在命令列表中 |
| `allowed-tools` | 是 | 命令可使用的工具列表，参考下方可用工具 |

**可用工具列表：**

| 工具 | 用途 | 示例 |
|------|------|------|
| `Bash` | 执行 shell 命令 | `git status`, `npm test` |
| `Read` | 读取文件内容 | 查看源代码、配置文件 |
| `Write` | 创建新文件 | 生成测试文件、文档 |
| `Edit` | 修改现有文件 | 修复代码、重构 |
| `AskUserQuestion` | 与用户交互 | 确认操作、收集输入 |
| `WebSearch` | 搜索网络信息 | 查找 API 文档 |
| `WebFetch` | 获取 URL 内容 | 读取在线文档 |

### 内容区块说明

| 区块 | 必填 | 说明 |
|------|------|------|
| `<objective>` | 是 | 一句话说明命令的目标 |
| `<rules>` | 否 | 约束规则，让命令行为可预测 |
| `<process>` | 是 | 执行流程概览，给 Claude 理解全局 |
| `<execution>` | 是 | 具体执行步骤 |

## 命令设计原则

### 1. 明确边界

命令应该职责单一。一个好的命令只做一件事，且做得彻底：

```markdown
<!-- 好的例子 -->
<objective>
分析当前分支的 commits 并生成 Release Notes
</objective>

<!-- 不好的例子 -->
<objective>
分析 commits、部署代码、通知团队成员
</objective>
```

### 2. 提供备选路径

考虑用户可能的不同选择：

```markdown
<execution>
1. 检查当前状态
2. 提供选项：
   - 选项 A: 合并并保留分支
   - 选项 B: 合并并删除分支
3. 根据用户选择执行
</execution>
```

### 3. 安全优先

- 破坏性操作前必须确认
- 提供撤销方案
- 防止在保护分支上执行危险操作

### 4. 输出清晰

使用格式化输出让结果一目了然：

```markdown
✅ 成功信息
❌ 错误信息
⚠️  警告信息
💡 提示信息
📊 统计数据
```

## 调试命令

新命令开发过程中，可以通过以下方式调试：

1. **检查格式**: 确保 frontmatter 和区块标记正确闭合
2. **本地测试**: 将命令文件放入 `.claude/commands/` 后直接在 Claude Code 中调用
3. **查看日志**: Claude Code 会显示命令读取情况，观察是否有解析错误

## 提交新命令

如果你是项目贡献者，按以下步骤提交新命令：

1. 在 `commands/` 下创建命令文件
2. 在 `scripts/install.js` 中注册
3. 添加命令行选项支持（如需）
4. 更新文档
5. 提交 Pull Request

欢迎提交 PR 添加新的命令类别！

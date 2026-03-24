# 扩展新类别

Claude Tools 支持扩展新的命令类别。

## 创建新类别

### 1. 创建目录结构

在 `commands/` 目录下创建新的类别目录：

```
commands/
├── git/          # 现有
└── workflow/     # 新类别
    ├── review.md
    └── deploy.md
```

### 2. 创建命令文件

每个命令是一个 Markdown 文件，使用以下格式：

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

<process>
1. 获取待审查的变更
2. 分析代码质量
3. 输出审查报告
</process>

<execution>
## 具体执行步骤...
</execution>
```

### 3. 配置类别描述（可选）

在 `bin/cli.js` 的 `getCategoryDescription` 函数中添加描述：

```javascript
function getCategoryDescription(category) {
  const descriptions = {
    git: 'Git 工作流命令',
    workflow: '工作流命令'  // 新增
  };
  return descriptions[category] || `${category} 命令`;
}
```

## 命令文件格式

### Frontmatter

| 字段 | 说明 |
|------|------|
| `name` | 命令名称（格式：`类别:命令`） |
| `description` | 命令描述 |
| `allowed-tools` | 允许使用的工具列表 |

### 内容区块

| 区块 | 说明 |
|------|------|
| `<objective>` | 命令目标 |
| `<rules>` | 执行规则 |
| `<process>` | 执行流程概述 |
| `<execution>` | 具体执行步骤 |

## 贡献

欢迎提交 PR 添加新的命令类别！

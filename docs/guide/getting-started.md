# 快速开始

本指南将帮助你在几分钟内开始使用 Claude Tools。

## 前置要求

- Node.js 18.0 或更高版本
- Git 已安装并配置

## 安装

### 交互式安装（推荐）

```bash
npx skills add xiao-an-c/claude-tools
```

然后按照提示选择要安装的命令类别。

### 安装所有技能

```bash
npx skills add xiao-an-c/claude-tools -s git-flow
npx skills add xiao-an-c/claude-tools -s dev-flow
```

### 安装指定技能

```bash
# 只安装 git-flow 技能
npx skills add xiao-an-c/claude-tools -s git-flow
```

## 验证安装

安装完成后，可以通过以下方式验证技能是否正确安装：

在 Claude Code 中输入 `/` 查看可用技能列表，应该能看到 `git-flow` 和 `dev-flow` 相关的命令。

## 第一个工作流

### 1. 初始化项目

```bash
git-flow init
```

### 2. 开始新功能

```bash
git-flow start-feat add-user-profile
```

### 3. 开发并提交

```bash
# ... 编写代码 ...
git-flow commit 添加用户资料页面
```

### 4. 完成功能

```bash
git-flow finish
```

## 下一步

- 查看 [Git 命令](/commands/git/) 了解所有可用命令
- 阅读 [Git 分支规范](/specs/git-branch-spec) 了解工作流详情
- 遇到问题？查阅 [常见问题](/guide/faq)

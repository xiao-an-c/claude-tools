# 快速开始

本指南将帮助你在几分钟内开始使用 Claude Tools。

## 前置要求

- Node.js 18.0 或更高版本
- Git 已安装并配置

## 安装

### 交互式安装（推荐）

```bash
npx github:xiao-an-c/claude-tools
```

然后按照提示选择要安装的命令类别。

### 安装所有命令

```bash
npx github:xiao-an-c/claude-tools --all
```

### 安装指定类别

```bash
# 只安装 git 命令
npx github:xiao-an-c/claude-tools -c git
```

### 安装指定命令

```bash
# 只安装 commit 和 sync 命令
npx github:xiao-an-c/claude-tools --commands commit,sync
```

## 验证安装

安装完成后，你可以在项目中看到 `.claude/commands/` 目录：

```bash
ls .claude/commands/git/
```

## 第一个工作流

### 1. 初始化项目

```bash
/git:init
```

### 2. 开始新功能

```bash
/git:start-feat add-user-profile
```

### 3. 开发并提交

```bash
# ... 编写代码 ...
/git:commit 添加用户资料页面
```

### 4. 完成功能

```bash
/git:finish
```

## 下一步

- 查看 [Git 命令](/commands/git/) 了解所有可用命令
- 阅读 [Git 分支规范](/specs/git-branch-spec) 了解工作流详情

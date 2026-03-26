# 架构设计

**分析日期：** 2026-03-26

## 整体架构

**架构模式：** 插件安装器模式（命令分发系统）

**核心特征：**
- CLI 工具，将基于 Markdown 的命令模板安装到 Claude Code 的 `.claude/commands/` 目录
- 命令文件为 YAML frontmatter 的 Markdown 文档，定义 AI Agent 指令
- 运行时从文件系统动态发现可用命令
- 无构建步骤，纯运行时组合命令分类

## 分层结构

**CLI 入口层：**
- 职责：命令行接口和参数解析
- 位置：`bin/cli.js`
- 内容：CLI 主逻辑、参数解析、帮助显示、交互提示
- 依赖：Node.js 内置模块（fs, path, readline）
- 使用者：最终用户（通过 npx 或直接执行）

**命令模板层：**
- 职责：按分类组织源命令定义
- 位置：`commands/{category}/*.md`
- 内容：Git 工作流命令（abort, commit, finish 等）和测试命令（generate, review, coverage, snapshot）
- 依赖：无（静态 Markdown 文件）
- 使用者：CLI 安装时复制到目标项目

**安装目标位置：**
- 位置：`{目标项目}/.claude/commands/{category}/{command}.md`
- 职责：Claude Code 命令提示，在 Agent 中显示为 `/category:command`

## 数据流向

**命令安装流程：**

1. 用户调用 CLI（如 `--all`、`-c git`、`--commands commit,sync`）
2. CLI 解析参数，确定目标目录（当前目录或指定路径）
3. CLI 通过 `loadCategories()` 加载分类配置 — 读取 `commands/` 子目录
4. 对每个待安装命令：
   - 源：`commands/{category}/{command}.md`
   - 目标：`{targetDir}/.claude/commands/{category}/{command}.md`
5. CLI 递归创建目标目录，复制 Markdown 文件
6. 输出确认安装成功/失败

**分类发现流程：**

1. `loadCategories()` 扫描 `commands/` 目录下的子目录
2. 每个子目录名作为一个分类
3. 分类目录内以 `.md` 结尾的文件成为命令
4. 分类描述从 `getCategoryDescription()` 映射中加载

## 核心抽象

**CLI 模块：**
- 职责：集中导出所有安装功能
- 示例：`bin/cli.js`
- 模式：CommonJS 模块，命名导出所有公共函数
- 导出：`getPackageDir`、`loadCategories`、`getCategoryDescription`、`installCommands`、`installAll`、`installCategory`、`installSpecific`、`interactiveSelect`、`showHelp`、`listCommands`、`main`、`TARGET_BASE`

**命令模板：**
- 职责：定义 Claude Code 命令的 Markdown 文件
- 示例：`commands/git/commit.md`、`commands/test/generate.md`
- 模式：YAML frontmatter（name, description, allowed-tools）+ Markdown 正文，包含 `<objective>`、`<rules>`、`<process>`、`<execution>` 部分

**分类配置：**
- 职责：将相关命令分组在同一个命名空间下
- 示例：`git`、`test` 分类
- 模式：动态 — 运行时从目录结构发现，描述在 `getCategoryDescription()` 函数中

## 入口点

**直接执行：**
- 位置：`bin/cli.js`
- 触发：`node bin/cli.js [选项] [目标目录]` 或 `npx github:xiao-an-c/claude-tools`
- 职责：解析参数、执行安装、显示输出

**模块导入：**
- 位置：`bin/cli.js`
- 触发：测试中 `require('../bin/cli.js')`
- 职责：导出所有函数供编程调用和测试

## 错误处理

**策略：** 降级处理 + 控制台输出

**模式：**
- 源目录缺失：返回 `{ installed: 0, failed: commands.length }` 并输出错误信息
- 命令文件未找到：报告单个失败，继续处理剩余命令
- 无效分类：直接调用时 exit(1)，作为模块导入时返回空结果
- 目标目录访问问题：`fs.mkdirSync` 的 `recursive: true` 选项处理创建

## 横切关注点

**日志：** 直接使用 `console.log` 输出状态信息（安装进度、错误）

**验证：** 通过 `args.includes()` 和 `args.findIndex()` 做参数解析，无正式验证 schema

**认证：** 不适用 — 这是只读的安装工具，仅复制文件

---

*架构分析：2026-03-26*

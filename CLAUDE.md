# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

claude-tools 是一个 Claude Code 技能（Skills）仓库，通过 `npx skills add` 分发。包含两个技能：

- **git-flow** — Git Flow 分支管理工作流
- **dev-flow** — 多 Agent 协作开发工作流

## 项目结构

```
skills/
  git-flow/           ← Git Flow 技能
    SKILL.md              ← 技能定义（YAML frontmatter + Markdown）
    manifest.json         ← 版本和兼容性元数据
    README.md             ← 英文说明
    README.zh-CN.md       ← 中文说明
  dev-flow/           ← 多 Agent 开发技能
    SKILL.md
    manifest.json
    README.md
    README.zh-CN.md
.claude-plugin/
  marketplace.json        ← 插件市场注册
```

## Skills 规范

每个 Skill 遵循 garden-skills 约定：

- `SKILL.md` — YAML frontmatter 包含 `name`（kebab-case）和 `description`（触发条件）
- `manifest.json` — `name`, `version`, `category`, `description`, `homepage`, `compat`
- `README.md` / `README.zh-CN.md` — 人类可读文档

## 分发方式

### npx skills add

```bash
npx skills add xiao-an-c/claude-tools -s git-flow
npx skills add xiao-an-c/claude-tools -s dev-flow
```

### 更新技能

```bash
npx skills update              # 更新所有已安装的技能
npx skills update dev-flow     # 只更新 dev-flow
npx skills update -g           # 只更新全局技能
npx skills update -p           # 只更新项目级技能
npx skills upgrade dev-flow    # upgrade 是 update 的别名
```

### Claude Code 插件市场

```
/plugin marketplace add xiao-an-c/claude-tools
/plugin install git-flow@claude-tools
```

## 常用命令

```bash
npm run docs:dev            # VitePress 文档开发服务器
npm run docs:build          # 构建 VitePress 文档
```

## 技能维护

- 修改 `SKILL.md` 时，同步检查 `README.md` / `README.zh-CN.md` 是否需要更新
- 发布新版本时，更新 `manifest.json` 和 `.claude-plugin/marketplace.json` 中的版本号
- 新增技能时，在 `.claude-plugin/marketplace.json` 的 `plugins` 数组中注册

## 设计哲学

整个技能体系围绕一个核心思路：**将不确定性转化为确定性**。

**收敛** — 固定的阶段、明确的角色分工、预定义的产出物，消除"接下来该做什么"的歧义。
**探索** — 无法匹配已知模式时，提供结构化的探索空间，不确定时不做不可逆操作。
**沉淀** — 探索结果经过严格质量门控过滤后入库，确保知识库高信噪比。
**增长** — 积累的知识收窄下一轮的不确定空间。

## 规范

- 技能内容以中文（简体）为主，README 中英双语
- 纯 Markdown + JSON，无构建步骤
- 遵循 garden-skills 的目录和文件约定

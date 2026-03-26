# 技术栈

**分析日期：** 2026-03-26

## 编程语言

**主要语言：**
- JavaScript (Node.js) — CLI 工具实现

**辅助语言：**
- Markdown — 命令定义和文档

## 运行时

**环境：**
- Node.js >= 18.0.0（根据 `package.json` 中 `engines` 字段）

**包管理器：**
- npm（基于 package-lock.json v3 格式判断为 v9.x）
- 锁文件：`package-lock.json`（已存在）

## 框架

**核心框架：**
- 无 — 纯 Node.js CLI 应用

**测试框架：**
- Jest ^29.7.0 — JavaScript 测试框架

**文档框架：**
- VitePress ^1.6.4 — 静态文档站点生成器
- Mermaid ^11.13.0 — 文档中的图表渲染

**CLI：**
- readline（Node.js 内置）— 交互式 CLI 提示

## 关键依赖

**无运行时依赖** — 这是一个极简 CLI 工具，仅依赖 Node.js 内置模块（`fs`、`path`、`readline`）。

**开发依赖：**
- `jest` ^29.7.0 — 测试框架
- `mermaid` ^11.13.0 — 文档图表渲染
- `vitepress` ^1.6.4 — 文档站点生成器

## 配置文件

**项目配置：**
- `package.json` — 项目元数据、脚本、依赖
- `jest.config.js` — Jest 测试配置
- `docs/.vitepress/config.mts` — VitePress 站点配置

**Jest 配置**（`jest.config.js`）：
```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['bin/**/*.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov']
};
```

**VitePress 配置**（`docs/.vitepress/config.mts`）：
- 标题："Claude Tools"
- Base：`/claude-tools/`（用于 GitHub Pages 部署）
- 本地搜索提供者
- 通过自定义代码块渲染器支持 Mermaid 图表

## 平台要求

**开发环境：**
- Node.js >= 18
- npm

**生产环境：**
- Node.js >= 18（仅运行时，CLI 无需构建步骤）
- 目标平台：类 Unix 系统（CLI 使用 shebang `#!/usr/bin/env node`）

---

*技术栈分析：2026-03-26*

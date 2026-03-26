# 代码库结构

**分析日期：** 2026-03-26

## 目录布局

```
/Users/denglian/mine/claude-tools/
├── bin/                    # CLI 入口点
│   └── cli.js              # CLI 主实现
├── commands/               # 源命令模板
│   ├── git/                # Git 工作流命令
│   │   ├── abort.md
│   │   ├── commit.md
│   │   ├── finish.md
│   │   ├── init.md
│   │   ├── publish.md
│   │   ├── start-feat.md
│   │   ├── start-fix.md
│   │   ├── start-hotfix.md
│   │   ├── start-refactor.md
│   │   ├── start-release.md
│   │   ├── status.md
│   │   ├── sync.md
│   │   └── wip.md
│   └── test/               # 测试生成命令
│       ├── coverage.md
│       ├── generate.md
│       ├── review.md
│       └── snapshot.md
├── __tests__/              # Jest 测试套件
│   ├── cli.test.js         # CLI 模块测试
│   └── fixtures/           # 测试fixtures
├── docs/                   # VitePress 文档
│   ├── guide/              # 用户指南
│   ├── commands/           # 命令文档
│   ├── specs/              # 规范文档
│   └── .vitepress/         # VitePress 配置
├── .claude/commands/       # 已安装命令（开发用）
│   ├── git/
│   └── test/
├── .github/workflows/      # CI/CD 配置
├── coverage/               # 测试覆盖率报告
├── package.json           # 项目清单
├── jest.config.js          # Jest 配置
└── README.md               # 项目文档
```

## 目录用途

**`bin/`：**
- 用途：CLI 入口点
- 内容：`cli.js` — 主可执行文件
- 关键文件：`cli.js`

**`commands/`：**
- 用途：分发的源命令模板
- 内容：分类子目录中的 `.md` 命令文件
- 关键文件：`git/*.md`、`test/*.md`

**`__tests__/`：**
- 用途：Jest 测试套件
- 内容：`cli.test.js` — CLI 函数完整测试
- 关键文件：`cli.test.js`

**`docs/`：**
- 用途：VitePress 文档站点
- 内容：用户指南、命令文档、规范说明

**`.claude/commands/`：**
- 用途：开发安装目标
- 内容：本地安装的 commands 副本
- 注意：已被 gitignore — 表示已安装状态，非源码

## 关键文件位置

**入口点：**
- `bin/cli.js`：主 CLI 可执行文件，shebang `#!/usr/bin/env node`

**配置：**
- `package.json`：项目元数据、依赖、脚本、bin 入口
- `jest.config.js`：Jest 测试运行器配置

**核心逻辑：**
- `bin/cli.js`：所有 CLI 功能（292 行）

**测试：**
- `__tests__/cli.test.js`：CLI 模块完整测试套件

## 命名规范

**文件：**
- JavaScript：`lowercase.js`（cli.js, jest.config.js）
- Markdown 命令：`kebab-case.md`（start-feat.md, commit.md）
- 目录：`lowercase/`（bin/, commands/, docs/）

**函数：**
- camelCase：`getPackageDir`、`loadCategories`、`installCommands`、`installAll`

**变量：**
- camelCase：`packageDir`、`targetDir`、`consoleOutput`
- 常量：未使用 UPPER_SNAKE_CASE，直接赋值使用

**分类（目录名）：**
- 小写：`git`、`test`

**命令（文件名）：**
- kebab-case：`start-feat`、`start-hotfix`、`sync`

## 在哪里添加新代码

**在已有分类中添加新命令：**
1. 在 `commands/{category}/` 下创建新的 `.md` 文件
2. 遵循 YAML frontmatter 模式（name, description, allowed-tools）
3. Markdown 正文包含 `<objective>`、`<rules>`、`<process>`、`<execution>` 部分

**新增分类：**
1. 在 `commands/` 下创建新目录（如 `commands/workflow/`）
2. 在新目录下添加 `.md` 命令文件
3. 更新 `bin/cli.js` 中的 `getCategoryDescription()` 包含新分类
4. 分类会被自动发现用于安装

**新增 CLI 函数：**
1. 在 `bin/cli.js` 中添加函数
2. 在 `module.exports` 对象中导出函数
3. 在 `__tests__/cli.test.js` 中添加对应测试

**测试 fixtures：**
- 位置：`__tests__/fixtures/`
- 创建符合 fixture 需求的子目录结构

## 特殊目录

**`.claude/commands/`：**
- 用途：Claude Code 自定义命令目录
- 是否生成：是，通过 CLI 安装过程生成
- 是否提交：否，已被 gitignore

**`coverage/`：**
- 用途：Jest 覆盖率报告
- 是否生成：是，通过 `npm test -- --coverage`
- 是否提交：是，用于 CI 可视化

**`node_modules/`：**
- 用途：npm 依赖
- 是否生成：是，通过 `npm install`
- 是否提交：否

**`.vitepress/dist/`：**
- 用途：构建后的 VitePress 站点
- 是否生成：是，通过 `npm run docs:build`
- 是否提交：是，用于 GitHub Pages 部署

---

*结构分析：2026-03-26*

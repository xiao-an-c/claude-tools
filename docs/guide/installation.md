# 安装详解

## 安装方式

### 从 GitHub 安装（推荐）

使用 `npx skills add` 直接从 GitHub 安装技能：

```bash
# 安装 Git Flow 技能
npx skills add xiao-an-c/claude-tools -s git-flow

# 安装 Dev Flow 技能
npx skills add xiao-an-c/claude-tools -s dev-flow
```

### 本地开发安装

如果你想在本地开发或测试：

```bash
git clone https://github.com/xiao-an-c/claude-tools.git
cd claude-tools
npm install
```

本地开发时可以修改 `skills/` 目录下的技能文件，然后使用 `npx skills add` 从本地路径安装进行测试。

### 安装到指定项目

```bash
# 在目标项目目录中执行
cd /path/to/project
npx skills add xiao-an-c/claude-tools -s git-flow
```

## 技能结构

安装后，技能会被 Claude Code 识别并加载：

```
skills/
├── git-flow/
│   ├── SKILL.md              # 技能定义
│   ├── manifest.json         # 版本信息
│   ├── commands/             # 命令文件
│   │   ├── init.md
│   │   ├── commit.md
│   │   └── ...
│   ├── README.md
│   └── README.zh-CN.md
└── dev-flow/
    ├── SKILL.md
    ├── manifest.json
    ├── commands/             # 命令文件
    ├── agents/               # Agent 定义
    ├── workflows/            # 工作流定义
    ├── README.md
    └── README.zh-CN.md
```

## VitePress 文档本地开发

如果你需要运行文档站点：

```bash
npm run docs:dev            # 启动文档开发服务器
npm run docs:build          # 构建文档
```

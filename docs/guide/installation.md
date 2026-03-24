# 安装详解

## 命令行选项

| 选项 | 简写 | 说明 |
|------|------|------|
| `--all` | `-a` | 安装所有命令 |
| `--list` | `-l` | 列出所有可用命令 |
| `--category <name>` | `-c` | 安装指定类别 |
| `--commands <cmd1,cmd2>` | | 安装指定命令 |
| `--help` | `-h` | 显示帮助信息 |

## 安装方式

### 从 GitHub 安装（推荐）

最简单的方式是使用 npx 直接从 GitHub 安装：

```bash
npx github:xiao-an-c/claude-tools --all
```

### 本地开发安装

如果你想在本地开发或测试：

```bash
git clone https://github.com/xiao-an-c/claude-tools.git
cd claude-tools
npm install
node bin/cli.js --all
```

### 安装到指定项目

```bash
# 安装到指定路径
npx github:xiao-an-c/claude-tools --all /path/to/project
```

## 安装位置

命令会被安装到目标项目的 `.claude/commands/` 目录：

```
your-project/
└── .claude/
    └── commands/
        └── git/
            ├── init.md
            ├── commit.md
            └── ...
```

::: tip
建议将 `.claude/` 目录添加到 `.gitignore`，因为这是个人偏好设置。
:::

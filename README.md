# Claude Tools

可扩展的 Claude Code 命令集，支持选择性安装。

## 安装

### 从 GitHub 安装（推荐）

```bash
# 交互式选择安装
npx github:xiao-an-c/claude-tools

# 安装所有命令
npx github:xiao-an-c/claude-tools --all

# 安装指定类别
npx github:xiao-an-c/claude-tools -c git

# 安装指定命令
npx github:xiao-an-c/claude-tools --commands commit,sync,status

# 安装到指定项目
npx github:xiao-an-c/claude-tools --all /path/to/project
```

### 本地安装

```bash
git clone https://github.com/xiao-an-c/claude-tools.git
cd claude-tools
node bin/cli.js --all
```

## 命令行选项

| 选项 | 说明 |
|------|------|
| `--all`, `-a` | 安装所有命令 |
| `--list`, `-l` | 列出所有可用命令 |
| `--category`, `-c <name>` | 安装指定类别 |
| `--commands <cmd1,cmd2>` | 安装指定命令 |
| `--help`, `-h` | 显示帮助 |

## 可用类别

### [git] Git 工作流命令

基于 Git Flow 的分支管理命令集。

| 命令 | 用途 |
|------|------|
| `/git:init` | 初始化 Git 分支规范 |
| `/git:start-feat` | 开始新功能开发 |
| `/git:start-fix` | 开始 Bug 修复 |
| `/git:start-refactor` | 开始代码重构 |
| `/git:start-hotfix` | 开始紧急修复 |
| `/git:start-release` | 创建发布分支 |
| `/git:commit` | 智能提交（自动前缀） |
| `/git:sync` | 同步基础分支代码 |
| `/git:wip` | 保存工作进度 |
| `/git:status` | 查看分支状态和建议 |
| `/git:finish` | 完成并合并分支 |
| `/git:publish` | 发布到 master |
| `/git:abort` | 放弃当前分支 |

### [test] 测试辅助命令

基于 AAA 模式的单元测试辅助命令集。

| 命令 | 用途 |
|------|------|
| `/test:generate` | 为模块生成单元测试 |
| `/test:snapshot` | 生成快照测试 |
| `/test:review` | 审查测试质量 |
| `/test:coverage` | 分析测试覆盖率 |

## 扩展新类别

1. 在 `commands/` 下创建新目录：
   ```
   commands/
   ├── git/          # 现有
   └── workflow/     # 新类别
       └── xxx.md
   ```

2. 在 `bin/cli.js` 的 `CATEGORIES` 中添加配置：
   ```js
   const CATEGORIES = {
     git: { ... },
     workflow: {
       description: '工作流命令',
       commands: ['xxx', 'yyy']
     }
   };
   ```

## 工作流程示例

### 日常开发
```bash
/git:start-feat add-user-profile
# ... 开发 ...
/git:commit 添加用户资料页面
/git:finish
```

### 发布流程
```bash
/git:start-release v1.2.0
# ... 测试 ...
/git:publish
```

### 紧急修复
```bash
/git:start-hotfix payment-crash
# ... 修复 ...
/git:finish
```

## License

MIT

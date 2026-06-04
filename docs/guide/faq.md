# 常见问题

## 安装与配置

### 安装时提示 "command not found"？

确保你已安装 Node.js 18+ 并在项目根目录执行：

```bash
npx skills add xiao-an-c/claude-tools
```

如果使用 `npm` 镜像源，请先恢复默认源或确保 GitHub 包可访问。

### 如何只安装个别技能？

```bash
# 只安装 git-flow 技能
npx skills add xiao-an-c/claude-tools -s git-flow

# 只安装 dev-flow 技能
npx skills add xiao-an-c/claude-tools -s dev-flow
```

### .claude/commands 目录应该提交到 git 吗？

Claude Tools 使用 Skills 架构，不再通过 `.claude/commands/` 目录安装。如果你有其他 `.claude/` 目录下的个人配置，建议添加到 `.gitignore`：

```bash
echo ".claude/" >> .gitignore
```

团队中的每个成员可以独立安装自己需要的技能。

### 安装后技能不生效？

确保技能已正确安装。在 Claude Code 中输入 `/` 查看可用技能列表，检查 `git-flow` 和 `dev-flow` 是否出现在列表中。如果未出现，重新运行安装命令：

```bash
npx skills add xiao-an-c/claude-tools -s git-flow
```

## Git 工作流

### master 和 main 有什么区别？

项目自动支持两种命名方式。初始化时（`git-flow init`）会检测现有主分支名：

- 已有 `master` → 使用 `master`
- 已有 `main` → 使用 `main`
- 两者都没有 → 询问用户选择

### feat 和 fix 分支应该从哪里创建？

- `feat/*`、`fix/*`、`refactor/*` → 从 `develop` 创建
- `hotfix/*` → 从 `master` 创建
- `release/*` → 从 `develop` 创建

创建命令会自动切换到正确的源分支并拉取最新代码。

### 不小心在 master 分支提交了代码怎么办？

```bash
# 1. 撤销最近一次提交但保留更改
git reset HEAD~1

# 2. 创建正确的功能分支
git-flow start-feat my-feature

# 3. 提交代码
git-flow commit 我的更改
```

### 如何撤销 git-flow finish 的合并？

```bash
# 找到合并前的 commit
git reflog

# 重置到合并前的状态
git reset --hard HEAD@{n}
```

如果已经推送到远程：

```bash
# 强制推送前请确认团队知晓
git push --force origin develop
```

### hotfix 和 fix 的区别是什么？

| 维度 | fix | hotfix |
|------|-----|--------|
| 紧急程度 | 不紧急 | 紧急，需立即发布 |
| 源分支 | develop | master |
| 合并目标 | develop | master + develop |
| 发布时机 | 随下个版本 | 立即发布 |

**判断标准**：如果线上生产环境出问题、影响用户使用 → hotfix。如果开发或测试环境的问题 → fix。

### 如何处理合并冲突？

`git-flow sync` 同步时可能出现冲突：

1. 查看冲突文件：`git status`
2. 编辑文件解决冲突（搜索 `<<<<<<<`、`=======`、`>>>>>>>` 标记）
3. 标记已解决：`git add <file>`
4. 完成合并：`git commit`

解决完成后建议运行测试确认代码正常。

## 提交规范

### commit 前缀是自动生成的吗？

是的。`git-flow commit` 会根据当前分支类型自动添加前缀：

| 分支 | 生成格式 |
|------|---------|
| feat/* | `feat(scope): message` |
| fix/* | `fix(scope): message` |
| refactor/* | `refactor(scope): message` |
| hotfix/* | `fix(scope): [紧急] message` |
| release/* | `chore(release): message` |

scope 会根据修改的文件路径自动推断。

### 可以自定义 commit 前缀吗？

当前版本使用预设规则。如需自定义，可以修改对应命令文件或通过 Claude Code 直接执行 git commit。

### commit 信息中的 scope 怎么来的？

命令会分析 `git diff --stat` 中的文件路径，自动推断 scope：

- `src/views/user/*` → scope: `user`
- `src/api/*` → scope: `api`
- `src/components/UserCard/*` → scope: `UserCard`

## 故障排除

### 命令提示 "Not a git repository"？

确保在当前 git 仓库中执行：

```bash
git init     # 如果不是 git 仓库
git-flow init    # 初始化分支结构
```

### "Branch not found" 错误？

检查基础分支是否存在（尤其是 develop）：

```bash
git branch -a
```

如果不存在，运行 `git-flow init` 创建。

### 推送被拒绝（rejected）？

```bash
# 拉取远程最新代码
git-flow sync

# 如果仍有冲突，手动解决后重试
```

### 命令输出乱码？

终端需要支持 UTF-8 编码。检查终端的字符编码设置：

```bash
echo $LANG
# 应输出包含 UTF-8 的值，如 zh_CN.UTF-8
```

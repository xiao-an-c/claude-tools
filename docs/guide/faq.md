# 常见问题

## 安装与配置

### 安装时提示 "command not found"？

确保你已安装 Node.js 18+ 并在项目根目录执行：

```bash
npx github:xiao-an-c/claude-tools
```

如果使用 `npm` 镜像源，请先恢复默认源或确保 GitHub 包可访问。

### 如何只安装个别命令？

```bash
# 只安装 git 类别
npx github:xiao-an-c/claude-tools -c git

# 只安装特定命令
npx github:xiao-an-c/claude-tools --commands commit,sync
```

### .claude/commands 目录应该提交到 git 吗？

不需要。.claude 目录属于个人开发环境配置，建议添加到 `.gitignore`：

```bash
echo ".claude/" >> .gitignore
```

团队中的每个成员可以独立安装自己需要的命令。

### 安装后命令不生效？

确保命令文件已正确安装到项目根目录的 `.claude/commands/` 下：

```bash
ls .claude/commands/git/
```

如果没有文件，重新运行安装命令。如果使用 Claude Code 的旧版本，请确认命令文件格式兼容。

## Git 工作流

### master 和 main 有什么区别？

项目自动支持两种命名方式。初始化时（`/git:init`）会检测现有主分支名：

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
/git:start-feat my-feature

# 3. 提交代码
/git:commit 我的更改
```

### 如何撤销 /git:finish 的合并？

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

`/git:sync` 同步时可能出现冲突：

1. 查看冲突文件：`git status`
2. 编辑文件解决冲突（搜索 `<<<<<<<`、`=======`、`>>>>>>>` 标记）
3. 标记已解决：`git add <file>`
4. 完成合并：`git commit`

解决完成后建议运行测试确认代码正常。

## 提交规范

### commit 前缀是自动生成的吗？

是的。`/git:commit` 会根据当前分支类型自动添加前缀：

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

## Test 命令

### /test:generate 支持哪些框架？

支持 Jest 和 Vitest。命令会自动检测项目中的测试框架配置。

### 生成的测试文件放在哪里？

默认放在 `tests/` 目录，保持与源文件相同的相对路径：

```
src/utils/parser.ts → tests/utils/parser.test.ts
src/api/client.ts   → tests/api/client.test.ts
```

### 覆盖率阈值在哪里配置？

优先级从高到低：

1. `jest.config.js/ts/mjs` → `coverageThreshold.global`
2. `package.json` → `jest.coverageThreshold`
3. `vitest.config.js/ts` → `test.coverage.thresholds`
4. 默认值: 80%

## 故障排除

### 命令提示 "Not a git repository"？

确保在当前 git 仓库中执行：

```bash
git init     # 如果不是 git 仓库
/git:init    # 初始化分支结构
```

### "Branch not found" 错误？

检查基础分支是否存在（尤其是 develop）：

```bash
git branch -a
```

如果不存在，运行 `/git:init` 创建。

### 推送被拒绝（rejected）？

```bash
# 拉取远程最新代码
/git:sync

# 如果仍有冲突，手动解决后重试
```

### 命令输出乱码？

终端需要支持 UTF-8 编码。检查终端的字符编码设置：

```bash
echo $LANG
# 应输出包含 UTF-8 的值，如 zh_CN.UTF-8
```

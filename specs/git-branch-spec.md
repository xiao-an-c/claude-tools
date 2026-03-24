# Git 分支规范

## 一、分支结构

### 1.1 推荐的分支结构

```
                    ┌─────────────────────────────────────────┐
                    │              master (生产)              │
                    │   只接受来自 release 分支的合并         │
                    └─────────────────────────────────────────┘
                                      ↑
                                      │ 发布
                    ┌─────────────────────────────────────────┐
                    │           release/* (预发布)            │
                    │   命名：release/v1.0, release/v2.0      │
                    │   用于版本测试和预发布                  │
                    └─────────────────────────────────────────┘
                                      ↑
                                      │ 集成测试
                    ┌─────────────────────────────────────────┐
                    │            develop (开发集成)           │
                    │   所有功能分支合并到此分支              │
                    │   用于日常集成和测试                    │
                    └─────────────────────────────────────────┘
                                      ↑
                    ┌────────────────┼────────────────┐
                    │                │                │
            ┌───────┴───────┐ ┌─────┴─────┐ ┌───────┴───────┐
            │  feat/xxx     │ │ fix/xxx   │ │ refactor/xxx  │
            │  功能分支     │ │ 修复分支  │ │ 重构分支      │
            └───────────────┘ └───────────┘ └───────────────┘
```

### 1.2 分支类型定义

| 分支类型 | 命名规范 | 说明 | 生命周期 |
|---------|---------|------|---------|
| `master` | `master` | 生产环境分支，只接受来自 release 的合并 | 永久 |
| `release/*` | `release/v<version>` | 预发布分支，用于版本测试 | 版本发布后可删除 |
| `develop` | `develop` | 开发集成分支，所有功能合并到此 | 永久 |
| `feat/*` | `feat/<issue-id>-<description>` | 新功能开发 | 合并后删除 |
| `fix/*` | `fix/<issue-id>-<description>` | Bug 修复 | 合并后删除 |
| `refactor/*` | `refactor/<issue-id>-<description>` | 代码重构 | 合并后删除 |
| `hotfix/*` | `hotfix/<issue-id>-<description>` | 紧急修复（基于 master） | 合并后删除 |

### 1.3 分支命名示例

```bash
# 功能分支
feat/PROJ-123-add-user-profile
feat/PROJ-456-implement-dashboard

# 修复分支
fix/PROJ-789-fix-login-error
fix/PROJ-101-optimize-search

# 重构分支
refactor/PROJ-202-refactor-api-layer

# 紧急修复
hotfix/PROJ-303-fix-payment-crash

# 发布分支
release/v1.2.0
release/v2.0.0
```

---

## 二、关键概念说明

### 2.1 release vs master 的区别

| 对比项 | master | release/* |
|-------|--------|-----------|
| **用途** | 生产环境代码 | 预发布测试环境 |
| **稳定性** | 最稳定，已通过完整测试 | 较稳定，正在测试中 |
| **代码来源** | 只接受 release 分支合并 | 从 develop 创建 |
| **生命周期** | 永久存在 | 版本发布后可删除 |
| **部署环境** | 线上生产环境 | UAT/预发布环境 |
| **修改权限** | 禁止直接修改 | 仅允许 bug 修复 |
| **版本标签** | 打 tag（v1.0.0） | 不打 tag |

**为什么需要 release 分支？**

```
场景：准备发布 v1.2.0

1. 从 develop 创建 release/v1.2.0
2. 部署到预发布环境进行测试
3. 测试发现问题 → 在 release/v1.2.0 上修复
4. 测试通过 → 合并到 master，打 tag v1.2.0
5. 删除 release/v1.2.0
```

**好处**：
- ✅ develop 可以继续开发新功能，不影响发布
- ✅ release 分支专注于测试和修复，保证发布质量
- ✅ 如果测试失败，master 不会受影响

### 2.2 fix vs hotfix 的区别

| 对比项 | fix/* | hotfix/* |
|-------|-------|----------|
| **紧急程度** | 普通修复，不紧急 | 紧急修复，需要立即发布 |
| **基础分支** | 从 develop 创建 | 从 master 创建 |
| **合并目标** | 合并到 develop | 合并到 master + develop |
| **发布时机** | 随下一个版本发布 | 立即发布 |
| **场景** | 日常 bug 修复 | 线上紧急问题 |
| **流程** | 正常开发流程 | 跳过 release，直接发布 |

**场景对比**：

```
场景1：普通 bug（使用 fix）
- 发现用户头像上传有时加载慢
- 从 develop 创建 fix/optimize-avatar-loading
- 修复后合并到 develop
- 等待下一个版本一起发布

场景2：紧急 bug（使用 hotfix）
- 发现支付功能崩溃，用户无法付款
- 从 master 创建 hotfix/fix-payment-crash
- 修复后合并到 master，立即发布
- 同时合并到 develop，避免后续版本再次引入问题
```

**判断标准**：
- 🚨 **hotfix**：线上生产环境出现问题，影响用户使用，需要立即修复
- 🔧 **fix**：开发或测试环境发现的问题，可以等待正常发布周期

### 2.3 完整分支流转图

```
                    紧急修复路径
                    ┌──────────────────────────────────────┐
                    │                                      ↓
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  feat/  │───→│ develop │───→│release/ │───→│ master  │───→│ hotfix/ │
│  fix/   │    │         │    │  v1.0   │    │         │    │         │
│refactor │    │  开发   │    │  测试   │    │  生产   │    │  紧急   │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
                   ↑                                           │
                   └───────────────────────────────────────────┘
                              同步回 develop
```

---

## 三、工作流程

### 3.1 日常开发流程

```bash
# 1. 从 develop 创建功能分支
git checkout develop
git pull origin develop
git checkout -b feat/PROJ-123-add-user-profile

# 2. 开发功能
# ... 编写代码 ...

# 3. 提交代码
git add .
git commit -m "feat(user): 添加用户资料页面"

# 4. 推送到远程
git push -u origin feat/PROJ-123-add-user-profile

# 5. 合并到 develop（推荐使用 PR/MR）
git checkout develop
git pull origin develop
git merge feat/PROJ-123-add-user-profile
git push origin develop

# 6. 删除功能分支
git branch -d feat/PROJ-123-add-user-profile
git push origin --delete feat/PROJ-123-add-user-profile
```

### 3.2 发布流程

```bash
# 1. 从 develop 创建发布分支
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. 在发布分支上进行测试和修复
# ... 测试、修复 ...

# 3. 更新版本号
# 修改 package.json 中的 version

# 4. 合并到 master
git checkout master
git pull origin master
git merge release/v1.2.0
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin master --tags

# 5. 同步回 develop
git checkout develop
git merge release/v1.2.0
git push origin develop

# 6. 删除发布分支
git branch -d release/v1.2.0
git push origin --delete release/v1.2.0
```

### 3.3 紧急修复流程

```bash
# 1. 从 master 创建 hotfix 分支
git checkout master
git pull origin master
git checkout -b hotfix/PROJ-303-fix-payment-crash

# 2. 修复问题
# ... 修复代码 ...

# 3. 更新版本号（修订号 +1）
# 修改 package.json 中的 version: 1.2.0 -> 1.2.1

# 4. 合并到 master
git checkout master
git merge hotfix/PROJ-303-fix-payment-crash
git tag -a v1.2.1 -m "Hotfix v1.2.1"
git push origin master --tags

# 5. 同步到 develop
git checkout develop
git merge hotfix/PROJ-303-fix-payment-crash
git push origin develop

# 6. 删除 hotfix 分支
git branch -d hotfix/PROJ-303-fix-payment-crash
```

---

## 四、分支保护规则

### 4.1 master 分支

- ✅ 禁止直接推送
- ✅ 只接受来自 `release/*` 或 `hotfix/*` 的 PR/MR
- ✅ 需要至少 1 人 Code Review
- ✅ 合并前必须通过 CI 测试

### 4.2 develop 分支

- ✅ 禁止直接推送
- ✅ 只接受来自功能分支的 PR/MR
- ✅ 需要至少 1 人 Code Review（可选）
- ✅ 合并前必须通过 CI 测试

### 4.3 release/* 分支

- ✅ 禁止直接推送（除发布负责人外）
- ✅ 只接受来自 `develop` 或 `hotfix/*` 的合并
- ✅ 冻结代码，只允许 bug 修复

---

## 五、环境对应关系

| 分支 | 环境 | 说明 |
|------|------|------|
| `master` | 生产环境 | 线上运行代码 |
| `release/*` | 预发布环境 | UAT 测试环境 |
| `develop` | 开发环境 | 日常开发测试 |

---

## 六、提交信息规范

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(user): 添加用户头像上传` |
| `fix` | Bug 修复或优化 | `fix(delivery): 优化发货地市搜索` |
| `perf` | 性能优化 | `perf(api): 优化接口响应速度` |
| `refactor` | 代码重构 | `refactor(auth): 重构登录流程` |
| `docs` | 文档更新 | `docs(readme): 更新使用说明` |
| `chore` | 构建/工具配置 | `chore(deps): 更新依赖包` |

---

## 七、注意事项

1. **一个分支只做一件事**：保持分支小而专注，便于审查和回滚
2. **及时删除已合并的分支**：保持分支列表干净
3. **合并前先拉取最新代码**：减少冲突
4. **遇到冲突停止并询问**：不要自动处理冲突

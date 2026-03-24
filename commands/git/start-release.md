---
name: git:start-release
description: 创建发布分支 release/v*，用于版本预发布测试
allowed-tools:
  - Bash
  - AskUserQuestion
---

<objective>
从 develop 分支创建发布分支 release/v<version>，用于版本预发布测试。
</objective>

<process>
1. 获取用户输入的版本号（如果没有参数则询问）
2. 验证版本号格式（如 v1.2.0 或 1.2.0）
3. 检查当前是否有未提交的更改
4. 切换到 develop 分支并拉取最新代码
5. 创建发布分支 release/v<version>
6. 输出发布流程提示
</process>

<execution>
## 获取版本号

如果用户没有提供版本号，询问用户：
"请输入版本号（如 v1.2.0 或 1.2.0）："

## 格式化版本号

确保版本号以 v 开头，如输入 "1.2.0" 则转换为 "v1.2.0"

## 执行命令

```bash
# 检查未提交更改
CHANGES=$(git status --porcelain)

if [ -n "$CHANGES" ]; then
  echo "警告: 有未提交的更改，建议先提交或暂存"
  git status --short
fi

# 切换到 develop 并拉取
git checkout develop
git pull origin develop

# 创建发布分支
git checkout -b release/<version>
```

## 输出

📦 已创建发布分支: `release/<version>`
📌 基础分支: develop

📋 发布流程:
1. 在此分支进行测试和 Bug 修复
2. 更新 package.json 中的版本号
3. 测试通过后使用 `/git:publish` 发布到 master
4. 发布会自动同步回 develop

⚠️  注意: release 分支只允许 Bug 修复，不添加新功能
</execution>

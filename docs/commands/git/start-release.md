# /git:start-release

创建发布分支 release/v*，用于版本预发布测试。

## 用法

```bash
/git:start-release [version]
```

## 参数

- `version`: 版本号（如 v1.2.0 或 1.2.0）

## 功能

- 从 develop 分支创建发布分支
- 用于版本预发布测试
- 版本号自动格式化（添加 v 前缀）

## 执行流程

1. 获取版本号（如果没有参数则询问）
2. 验证版本号格式
3. 检查未提交更改
4. 切换到 develop 分支并拉取最新代码
5. 创建发布分支 release/v\<version\>

## 输出示例

```
📦 已创建发布分支: `release/v1.2.0`
📌 基础分支: develop

📋 发布流程:
1. 在此分支进行测试和 Bug 修复
2. 更新 package.json 中的版本号
3. 测试通过后使用 /git:publish 发布到 master
4. 发布会自动同步回 develop

⚠️  注意: release 分支只允许 Bug 修复，不添加新功能
```

## 发布工作流

```bash
# 1. 创建发布分支
/git:start-release v1.2.0

# 2. 测试和 Bug 修复
/git:commit 修复测试问题

# 3. 发布到 master
/git:publish
```

::: warning 注意
release 分支只允许 Bug 修复，不添加新功能。
:::

## 相关命令

- [/git:publish](./publish) - 发布到 master
- [/git:commit](./commit) - 智能提交
- [/git:finish](./finish) - 完成并合并分支

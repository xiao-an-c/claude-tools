# 外部集成

**分析日期：** 2026-03-26

## API 和外部服务

**未检测到任何外部 API 调用** — 此 CLI 工具不调用任何外部 API。

## 数据存储

**数据库：**
- 无

**文件存储：**
- 仅本地文件系统
- 命令以 `.md` 文件形式复制到目标项目的 `.claude/commands/` 目录

**缓存：**
- 无

## 认证和身份

**认证提供者：**
- 无 — 这是一个独立 CLI 安装工具

## 监控和可观测性

**错误追踪：**
- 无

**日志：**
- 仅控制台输出（`console.log`）

## CI/CD 和部署

**托管：**
- GitHub Pages（通过 VitePress 部署工作流）

**CI 流水线：**
- GitHub Actions（`.github/workflows/deploy.yml`）
- 触发条件：推送到 `main` 或 `develop` 分支
- 运行步骤：Node 20、`npm install`、`npm run docs:build`
- 部署到 GitHub Pages（`actions/deploy-pages@v4`）

**GitHub 集成：**
- 仓库：`github.com/xiao-an-c/claude-tools`
- 使用的 GitHub Actions：
  - `actions/checkout@v4`
  - `actions/setup-node@v4`
  - `actions/configure-pages@v4`
  - `actions/upload-pages-artifact@v3`
  - `actions/deploy-pages@v4`

## 环境配置

**所需环境变量：**
- 无 — 未使用任何环境变量

**密钥位置：**
- 不适用（无外部 API 调用）

## Webhook 和回调

**传入：**
- 无

**传出：**
- 无

---

*集成审计：2026-03-26*

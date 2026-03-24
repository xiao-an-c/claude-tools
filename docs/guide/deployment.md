# 部署文档

本文档说明 Claude Tools 文档站点的部署流程。

## 部署方式

文档使用 [VitePress](https://vitepress.dev/) 构建，并通过 [GitHub Actions](https://github.com/features/actions) 自动部署到 [GitHub Pages](https://pages.github.com/)。

## 访问地址

- 文档站点：https://xiao-an-c.github.io/claude-tools/

## 自动部署流程

### 触发条件

部署会在以下情况自动触发：

1. **推送到主分支**：当代码推送到 `main` 或 `develop` 分支，且 `docs/` 目录有变更时
2. **手动触发**：在 GitHub Actions 页面手动运行工作流

### 部署步骤

```mermaid
flowchart LR
    A[代码推送] --> B[GitHub Actions 触发]
    B --> C[安装依赖]
    C --> D[构建文档]
    D --> E[部署到 GitHub Pages]
    E --> F[站点更新]
```

## 手动部署

如需手动触发部署：

1. 访问 [Actions 页面](https://github.com/xiao-an-c/claude-tools/actions)
2. 选择 "Deploy VitePress site to Pages" 工作流
3. 点击 "Run workflow"
4. 选择分支并运行

## 本地预览

在本地预览构建结果：

```bash
# 安装依赖
npm install

# 构建文档
npm run docs:build

# 预览构建结果
npm run docs:preview
```

预览服务将在 `http://localhost:4173` 启动。

## 配置说明

### VitePress 配置

关键配置位于 `docs/.vitepress/config.mts`：

```ts
export default defineConfig({
  // GitHub Pages 项目站点基础路径
  base: '/claude-tools/',

  // 启用干净 URL
  cleanUrls: true,

  // 显示最后更新时间
  lastUpdated: true,
})
```

### GitHub Actions 配置

工作流文件位于 `.github/workflows/deploy.yml`，包含：

- **构建环境**：Node.js 20
- **包管理器**：npm
- **输出目录**：`docs/.vitepress/dist`

## 故障排除

### 常见问题

1. **页面显示空白或 404**
   - 检查 `base` 配置是否正确设置为 `/claude-tools/`
   - 确认 GitHub Pages 已启用并选择 GitHub Actions 作为源

2. **样式或资源加载失败**
   - 清除浏览器缓存
   - 检查构建日志是否有错误

3. **部署失败**
   - 查看 Actions 日志定位错误
   - 确认 Node.js 版本兼容性（需要 >= 18）

## 相关链接

- [VitePress 部署文档](https://vitepress.dev/guide/deploy)
- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

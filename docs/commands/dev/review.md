# /dev:review

代码审查模式（只读）。架构师审查代码质量，发现问题，提供建议。不修改任何文件。

## 用法

```bash
/dev:review <审查目标>
```

## 参数

| 参数 | 说明 |
|------|------|
| `审查目标` | 文件路径、模块名或功能描述。如 `src/components/Login.tsx` |

## 适用场景

- 想让架构师 review 一段代码
- 合并前想了解代码质量
- 想知道某个模块有什么问题

## 不适用

- 想直接改代码 -- 用 `/dev:fix` 或 `/dev:refactor`
- 想讨论方案 -- 用 `/dev:discuss`

## 执行流程

```
/dev:review src/components/Login.tsx
    |
Step 1: 解析审查目标
    |
Step 2: 架构师审查代码 (opus)
|        审查维度：代码质量、设计问题、潜在 bug、性能、安全、可维护性
    |
Step 3: 生成 REVIEW.md -> .dev/review/REVIEW.md
    |
Step 4: Recorder (sonnet) -- 记录审查发现
    |
Done. 建议后续命令
```

不使用 git、不创建分支。

## 审查维度

1. **代码质量** -- 命名、可读性、复杂度
2. **设计问题** -- 职责划分、耦合度、抽象层次
3. **潜在 bug** -- 边界条件、错误处理、并发问题
4. **性能** -- 明显的性能问题
5. **安全** -- 注入、XSS、敏感数据暴露
6. **可维护性** -- 测试难度、修改风险

## 产物文件

| 文件 | 说明 |
|------|------|
| REVIEW.md | 代码审查报告（严重问题、改进建议、做得好的地方） |

## 常见后续命令

审查完成后，根据发现的问题建议：

| 发现 | 建议下一步 |
|------|-----------|
| 有严重 bug | `/dev:fix <问题描述>` |
| 有设计改进 | `/dev:refactor <重构建议>` |
| 整体 OK | 可以合并 |

## 相关命令

- [/dev:discuss](./discuss) -- 架构讨论
- [/dev:investigate](./investigate) -- Bug 排查
- [/dev:fix](./fix) -- Bug 修复
- [/dev:refactor](./refactor) -- 代码重构

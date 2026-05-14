# /dev:investigate

Bug 排查模式（只读）。探索问题，定位根因，不修改任何代码。产出调查报告，为后续修复提供依据。

## 用法

```bash
/dev:investigate <问题描述>
```

## 参数

| 参数 | 说明 |
|------|------|
| `问题描述` | Bug 的症状描述，如 "用户登录后偶尔被踢出" |

## 适用场景

- 报了 bug 但不知道原因
- 需要理解某个问题的根因
- 想先调查再决定怎么修

## 不适用

- 已经知道原因，直接修 -- 用 `/dev:fix`
- 线上紧急故障 -- 用 `/dev:hotfix`
- 需要修改代码 -- 用 `/dev:fix` 或 `/dev:patch`

## 执行流程

```
/dev:investigate 用户登录后偶尔被踢出
    |
Step 1: 解析问题描述
    |
Step 2: 架构师探索代码 (opus)
|        追踪执行路径，定位根因
    |
Step 3: 生成调查报告 -> .dev/investigation/INVESTIGATION.md
    |
Step 4: Recorder (sonnet) -- 记录排查发现
    |
Done. 建议后续修复命令
```

不使用 git、不创建分支、不写 `.dev/` 目录。

## 产物文件

| 文件 | 说明 |
|------|------|
| INVESTIGATION.md | 调查报告（症状、调查过程、根因分析、影响范围、置信度） |

## 常见后续命令

排查完成后，根据发现建议：

| 发现 | 建议下一步 |
|------|-----------|
| 确认是 bug | `/dev:fix <问题描述>` |
| 是设计缺陷 | `/dev:refactor <重构建议>` |
| 需要新功能支持 | `/dev:feat <功能描述>` |
| 原因不明 | 继续调查或 `/dev:discuss` 讨论 |

## 相关命令

- [/dev:fix](./fix) -- Bug 修复
- [/dev:hotfix](./hotfix) -- 紧急修复
- [/dev:review](./review) -- 代码审查
- [/dev:discuss](./discuss) -- 架构讨论

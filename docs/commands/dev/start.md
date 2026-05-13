# /dev:start

开发工作流路由器。自动识别场景，从工作流库匹配并执行对应的工作流。是所有开发工作流的统一入口。

## 用法

```bash
/dev:start [描述]                        # 自动识别场景并匹配工作流
/dev:start --<mode> [描述]               # 手动指定模式
/dev:start --run <name> [描述]           # 执行指定工作流
/dev:start --list                        # 列出所有可用工作流
/dev:start --delete <name>               # 删除已沉淀的工作流
```

## 工作流发现

### 内置工作流

| 模式 | 命令 | 说明 |
|------|------|------|
| `--patch` | `/dev:patch` | 极小改动，已知怎么改。零 git、零文档 |
| `--fix` | `/dev:fix` | Bug 诊断 + 修复。架构师找根因，开发者修 |
| `--feat` | `/dev:feat` | 新功能开发。完整团队协作，自适应复杂度 |
| `--refactor` | `/dev:refactor` | 代码重构。架构师驱动，原子化步骤 |
| `--hotfix` | `/dev:hotfix` | 线上紧急修复。最小流程，最大速度 |
| `--review` | `/dev:review` | 代码审查。只读，产出审查报告 |
| `--discuss` | `/dev:discuss` | 架构讨论。只读，产出会议纪要 |
| `--investigate` | `/dev:investigate` | Bug 排查。只读，产出调查报告 |
| `--auto` | `/dev:auto` | 即兴编排。workflow-architect 动态设计工作流 |

### 已沉淀工作流

扫描 `.dev/workflows/` 目录发现用户保存的自定义工作流。这些工作流的 `description` 字段用于匹配用户任务描述。

### 匹配策略

1. **显式模式** — `--<mode>` 标志直接路由到对应工作流
2. **指定工作流** — `--run <name>` 使用指定工作流
3. **自然语言匹配** — 从描述中提取关键词，按优先级匹配：
   - 先匹配内置工作流关键词
   - 再匹配已沉淀工作流的 description
   - 无匹配 → `/dev:auto`

**匹配到直接执行，不需要用户确认。** 工作流本身就是确定性的。

所有模式支持 `--git` / `--no-git` 参数。

## 执行流程

```
/dev:start <描述>
    |
Step 1: 解析 --<mode> / --run / --git / --no-git 标志
    |
Step 2: 扫描 .dev/workflows/ 匹配任务描述
    |      有匹配 → 直接执行 commands/dev/run.md
    |      无匹配 → 执行 commands/dev/auto.md
```

路由器**只做分发**，不读源码、不分析代码、不 spawn Agent。

## 管理命令

| 命令 | 说明 |
|------|------|
| `/dev:start --list` | 列出所有可用工作流（内置 + 已沉淀） |
| `/dev:start --delete <name>` | 删除已沉淀的工作流（需用户确认） |

## 使用示例

```bash
/dev:start 添加用户登录功能          # 自动匹配 -> /dev:feat
/dev:start 修复登录白屏 bug          # 自动匹配 -> /dev:fix
/dev:start --patch 修个 typo         # 手动指定 -> /dev:patch
/dev:start --run custom-migration 迁移数据库  # 指定工作流
/dev:start --list                    # 查看可用工作流
```

## 模式衔接

只读模式产出分析文档后，自然衔接到代码修改模式：

```
/dev:investigate 排查 bug -> 建议用 /dev:fix 修复
/dev:discuss 讨论方案 -> 建议用 /dev:feat 实现
/dev:review 审查代码 -> 建议用 /dev:refactor 改进
```

## 相关命令

- [/dev:status](./status) -- 查看工作流状态
- [/dev:resume](./resume) -- 恢复中断的工作流
- [/dev:auto](./auto) -- 即兴编排模式

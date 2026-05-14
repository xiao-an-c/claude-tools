# Dev 工作流入口

所有开发工作流通过 `/dev:run <workflow-name>` 统一调用。`/dev:run` 是通用执行器，读取工作流定义文件并机械执行每个步骤。

## 工作流列表

### 代码修改工作流

| 工作流 | 调用 | 说明 |
|--------|------|------|
| patch | `/dev:run patch <描述>` | 极小改动，零 git 零文档 |
| fix | `/dev:run fix <描述>` | Bug 诊断 + 修复 |
| feat | `/dev:run feat <描述>` | 新功能开发，自适应复杂度 |
| refactor | `/dev:run refactor <描述>` | 代码重构，原子化步骤 |
| hotfix | `/dev:run hotfix <描述>` | 线上紧急修复 |
| auto | `/dev:run auto <描述>` | 即兴编排，动态设计工作流 |

### 只读命令

这些命令不通过工作流执行器，直接与 Agent 交互：

| 命令 | 说明 |
|------|------|
| `/dev:review` | 代码审查（只读，无 Git） |
| `/dev:discuss` | 架构讨论/开会（只读，无 Git） |
| `/dev:investigate` | Bug 排查（只读，无 Git） |

### 辅助命令

| 命令 | 说明 |
|------|------|
| `/dev:status` | 查看当前工作流状态和进度 |
| `/dev:resume` | 恢复中断的工作流 |

## 选择工作流

```
改动有多大？
  ├─ 1-2 个文件，已知怎么改 → /dev:run patch
  ├─ Bug 需要诊断 → /dev:run fix
  ├─ 新功能 → /dev:run feat
  ├─ 重构不改行为 → /dev:run refactor
  ├─ 线上紧急 → /dev:run hotfix
  └─ 不确定 / 跨类型 → /dev:run auto
```

## 通用参数

所有代码修改工作流支持：

| 参数 | 说明 |
|------|------|
| `--git` | 强制使用 git（创建分支） |
| `--no-git` | 跳过 git，在当前分支工作 |

## 自定义工作流

在项目的 `.dev/workflows/` 目录下创建 `<name>.md` 文件，按照内置工作流的格式编写，即可通过 `/dev:run <name>` 调用。自定义工作流优先于内置工作流。

## 模式衔接

只读命令产出分析文档后，自然衔接到代码修改工作流：

```
/dev:investigate 排查 bug -> 建议用 /dev:run fix 修复
/dev:discuss 讨论方案 -> 建议用 /dev:run feat 实现
/dev:review 审查代码 -> 建议用 /dev:run refactor 改进
```

## 相关命令

- [/dev:run](./run) -- 通用工作流执行器
- [/dev:status](./status) -- 查看工作流状态
- [/dev:resume](./resume) -- 恢复中断的工作流

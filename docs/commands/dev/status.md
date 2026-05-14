# /dev:status

查看当前开发工作流状态和进度。

## 用法

```bash
/dev:status
```

## 功能

- 显示当前分支的工作流模式和进度
- 逐步骤显示完成状态（基于工作流定义）
- 显示子分支状态（已合并/活跃/待执行）
- 给出下一步操作建议

## 输出格式

```
================================================================
 DEV WORKFLOW STATUS
================================================================
 分支: feat/user-login (feat)
 工作流: Feature Development (feat)
 状态: 进行中

 步骤进度: 6/13 完成
 ┃████████░░░░░░░░░░░░░░░░░░░░░░░ 46%
 ├─ Step 1: 参数解析 ✓
 ├─ Step 2: 创建分支 ✓
 ├─ Step 3: 初始化状态 ✓
 ├─ Step 4: 产品讨论 ✓
 ├─ Step 5: 复杂度评估 ✓
 ├─ Step 6: 并行设计 ✓
 ├─ Step 7: 任务规划 ◉ (当前)
 ├─ Step 8: 技术设计
 └─ ...

 子分支:
  [merged]   feat/user-auth-t01 — Login page
  [active]   feat/user-auth-t02 — Auth service (current)
  [pending]  feat/user-auth-t03 — Session mgmt

 提交数: 4
================================================================

 任务详情 (from TASK-LOG.md):
 | T-01 | 功能标题     | 完成 | abc1234 |
 | T-02 | 功能标题     | 完成 | def5678 |
 | T-03 | 功能标题     | 待执行 | -      |

 下一步:
   /dev:resume  — 继续执行未完成的步骤
   /git:status  — 查看 git 分支状态
   /git:finish  — 合并到 develop
```

## 信息来源

命令读取以下信息：

- **`.dev/config.yml`** — 工作流模式、分支类型、子分支配置
- **工作流定义** — `.dev/workflows/${mode}.md`（优先）或包内置 `workflows/${mode}.md`，获取步骤列表和名称
- **`.dev/plan/<branch>/`** — 各步骤的产出文件（判断完成状态）
- **TASK-LOG.md** — 执行记录表格
- **ACCEPTANCE.md** — 如果存在，标记为已完成

## 已沉淀工作流

如果 `.dev/workflows/` 目录存在自定义工作流，status 会列出所有可用工作流。

## 相关命令

- [/dev:run](./run) -- 启动工作流
- [/dev:resume](./resume) -- 恢复工作流
- [/git:status](../git/status) -- 查看 git 分支状态

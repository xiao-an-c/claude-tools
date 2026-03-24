# /git:status

查看当前分支状态和下一步建议。

## 用法

```bash
/git:status
```

## 功能

- 显示当前分支的详细状态
- 显示与基础分支的差异
- 显示未提交更改列表
- 根据分支状态给出操作建议

## 分支类型识别

| 分支类型 | 基础分支 |
|---------|---------|
| feat/* | 功能开发 → develop |
| fix/* | Bug 修复 → develop |
| refactor/* | 代码重构 → develop |
| hotfix/* | 紧急修复 → master |
| release/* | 版本发布 → develop |
| develop | 开发集成 → 无 |
| master | 生产环境 → 无 |

## 输出示例

```
╔════════════════════════════════════════════════╗
║              Git 分支状态                       ║
╠════════════════════════════════════════════════╣
║ 当前分支: feat/add-user-profile                 ║
║ 分支类型: 功能开发                              ║
║ 基础分支: develop                               ║
╠════════════════════════════════════════════════╣
║ 📊 提交状态                                     ║
║   - 领先基础分支: 3 个提交                       ║
║   - 落后基础分支: 1 个提交                       ║
╠════════════════════════════════════════════════╣
║ 📝 未提交更改                                   ║
║   M  src/views/User.vue                        ║
║   A  src/api/user.js                           ║
╚════════════════════════════════════════════════╝

💡 建议操作:
1. 提交更改: /git:commit
2. 同步代码: /git:sync
3. 完成开发: /git:finish
```

## 不同分支类型的建议

| 分支类型 | 建议操作流程 |
|---------|-------------|
| feat/fix/refactor | sync → commit → finish |
| hotfix | commit → finish（同时合并到 master 和 develop）|
| release | 测试 → publish |
| develop | 创建功能分支开始工作 |
| master | 禁止直接操作 |

## 相关命令

- [/git:commit](./commit) - 智能提交
- [/git:sync](./sync) - 同步基础分支
- [/git:finish](./finish) - 完成并合并分支

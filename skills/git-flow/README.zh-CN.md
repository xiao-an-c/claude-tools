# Git 工作流

Claude Code 的 Git Flow 分支管理方法论 Skill。教 Claude 按照 Git Flow 规范管理分支，支持 Epic Branching 父子分支模式。

## 覆盖范围

- **分支模型**：feat、fix、refactor、hotfix、release、develop、master
- **Epic Branching**：父子分支模式（`feat/user-auth-t01`）
- **智能提交**：根据分支类型自动添加 conventional commit 前缀
- **同步策略**：子分支从父分支同步，集成分支从 develop/master 同步
- **热修复流程**：自动合并到 master + develop 并打 tag
- **发布流程**：release 分支 → 测试 → 发布到 master

## 触发场景

当你要求以下操作时，Claude 会自动加载此 Skill：
- 创建分支（"开始一个新功能"、"创建修复分支"）
- 提交代码（"提交这个改动"）
- 同步或合并（"从 develop 同步"、"完成这个分支"）
- 管理发布（"创建 v1.0 发布分支"、"发布"）
- 紧急修复（"紧急修复支付崩溃"）
- 查看分支状态（"当前在哪个分支"）

## 快速示例

```
用户: "开始用户认证功能开发"
Claude: 从 develop 创建 feat/user-auth
用户: "提交登录页面"
Claude: git commit -m "feat(user): 添加登录页面"
用户: "完成这个功能"
Claude: 将 feat/user-auth 以 --no-ff 合并到 develop
```

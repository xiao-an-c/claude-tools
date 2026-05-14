# /git:start-task

从当前集成分支创建任务子分支，自动编号。

## 用法

```bash
/git:start-task [描述]
```

## 功能

- 在当前集成分支下创建任务子分支
- 自动检测已有子分支并分配编号
- 保持与父分支相同的分支类型

## 子分支命名

子分支格式：`<type>/<parent-slug>-t<NN>`

例如当前分支 `feat/user-auth`：
- 第一个子分支：`feat/user-auth-t01`
- 第二个子分支：`feat/user-auth-t02`

## 父子关系检测

通过正则匹配检测子分支：`^(feat|fix|refactor|hotfix|release)/(.+)-t\d+$`

- 匹配成功 → 是子分支，去掉 `-t\d+` 即为父分支名
- 不匹配 → 是普通集成分支或独立分支

## 错误处理

| 场景 | 处理 |
|------|------|
| 当前是子分支 | 拒绝创建，提示先切回父分支 |
| 当前是 develop/master | 拒绝创建，提示先切换到集成分支 |
| 子分支已存在 | 自动递增编号 |
| 有未提交更改 | 自动 stash，创建后 pop |

## 相关命令

- [/git:finish](./finish) - 合并子分支到父分支
- [/git:sync](./sync) - 从父分支同步代码
- [/git:status](./status) - 查看父子分支状态
- [/git:commit](./commit) - 智能提交

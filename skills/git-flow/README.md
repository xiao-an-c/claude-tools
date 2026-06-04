# Git Workflow

A Git Flow branching methodology skill for Claude Code. Teaches Claude to manage branches following Git Flow conventions with Epic Branching support.

## What it covers

- **Branch Model**: feat, fix, refactor, hotfix, release, develop, master
- **Epic Branching**: Parent-child sub-branch pattern (`feat/user-auth-t01`)
- **Smart Commits**: Auto-prefix conventional commits based on branch type
- **Sync Strategy**: Sub-branch from parent, integration from develop/master
- **Hotfix Pipeline**: Auto-merge to master + develop with tagging
- **Release Flow**: Release branch → test → publish to master

## When Claude activates this skill

Claude loads this skill when you ask to:
- Create branches (`start a feature`, `create a fix branch`)
- Commit code (`commit this`, `submit changes`)
- Sync or merge branches (`sync from develop`, `finish this branch`)
- Manage releases (`start release v1.0`, `publish`)
- Handle hotfixes (`emergency fix for payment crash`)
- Check branch status (`git status`, `what branch am I on`)

## Quick Example

```
User: "Start a new feature for user authentication"
Claude: Creates feat/user-auth from develop
User: "Commit the login page"
Claude: git commit -m "feat(user): 添加登录页面"
User: "Finish this feature"
Claude: Merges feat/user-auth into develop with --no-ff
```

## Installation

```bash
npx skills add xiao-an-c/claude-tools -s git-flow
```

### Update

```bash
npx skills update git-flow          # Update to latest version
npx skills update                   # Update all installed skills
npx skills update -g                # Update global skills only
```

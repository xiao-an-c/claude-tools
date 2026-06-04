# Dev Workflow

A multi-agent development workflow skill for Claude Code. Orchestrates 8 specialized agents through the full development lifecycle.

## What it covers

- **5 Workflow Types**: patch, fix, feat, refactor, hotfix
- **8 Specialized Agents**: product, architect, planner, tech-designer, developer, tester, workflow-architect, recorder
- **State Management**: `.dev/plan/` persistence with PRD, architecture, test design, task logs
- **Complexity Assessment**: Auto-detects simple vs complex and adapts the workflow

## How to use

This skill requires **explicit invocation** via `/dev-flow`:

```
/dev-flow feat user login feature     # Feature development
/dev-flow fix pagination bug          # Bug fix
/dev-flow hotfix payment failure      # Emergency fix
/dev-flow patch update config         # Lightweight patch
/dev-flow refactor utils              # Code refactoring
/dev-flow discuss Redis vs Postgres   # Architecture discussion
/dev-flow review src/routes/          # Code review
/dev-flow investigate why API is slow  # Bug investigation
/dev-flow status                      # Check status
/dev-flow                             # Show command guide
```

## Agent Team

| Agent | Role |
|-------|------|
| dev-product | Product manager — only agent that interacts with you |
| dev-architect | System architect — designs module structure |
| dev-planner | Task planner — breaks down work into tasks |
| dev-tech-designer | Tech designer — bridges architecture to implementation |
| dev-developer | Developer — writes the code |
| dev-tester | Tester — designs and runs tests |
| dev-flow-architect | Workflow designer — dynamic workflow orchestration |
| dev-recorder | Knowledge recorder — captures reusable insights |

## Installation

```bash
npx skills add xiao-an-c/claude-tools -s dev-flow
```

### Update

```bash
npx skills update dev-flow         # Update to latest version
npx skills update                  # Update all installed skills
npx skills update -g               # Update global skills only
```

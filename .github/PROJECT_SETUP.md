# GitHub Project Board Setup Guide

This guide documents the GitHub Project setup for the SOC 2 Compliance Platform.

## ✅ Setup Complete

All setup steps have been completed using automation scripts in `scripts/`.

| Step | Status | Script Used |
|------|--------|-------------|
| Repository | ✅ Done | Manual |
| Labels (25) | ✅ Done | `scripts/setup-labels.ps1` |
| Milestones (5) | ✅ Done | `scripts/setup-milestones.ps1` |
| Project Board | ✅ Done | `scripts/setup-project.ps1` |
| Issues (35) | ✅ Done | `scripts/setup-issues.ps1` |
| Issues → Project | ✅ Done | `scripts/add-issues-to-project.ps1` |

## Project Links

- **Repository**: https://github.com/MrCoderClark/SOC2
- **Project Board**: https://github.com/users/MrCoderClark/projects/3
- **Issues**: https://github.com/MrCoderClark/SOC2/issues
- **Milestones**: https://github.com/MrCoderClark/SOC2/milestones

## Scripts Reference

Re-run these scripts if needed (e.g., on a fresh clone):

```powershell
# Create labels
.\scripts\setup-labels.ps1

# Create milestones
.\scripts\setup-milestones.ps1

# Create project board (prompts for name, auto-links to repo)
.\scripts\setup-project.ps1

# Create all 35 issues
.\scripts\setup-issues.ps1

# Add issues to project board
.\scripts\add-issues-to-project.ps1
```

## Milestones

| Milestone | Phase | Description |
|-----------|-------|-------------|
| v0.1.0 - Foundation | 1 | Core infrastructure and setup |
| v0.2.0 - Core Features | 2 | Basic compliance tracking |
| v0.3.0 - Integrations | 3 | Third-party integrations |
| v0.4.0 - AI Features | 4 | AI-powered automation |
| v1.0.0 - Enterprise | 5 | Enterprise features |

## Project Board Automation (Optional)

Enable these automations in Project Settings → Workflows:
- Auto-add new issues to Backlog
- Move to "In Progress" when assigned
- Move to "Done" when issue is closed

## Quick Start Commands

```bash
# View all issues
gh issue list

# View project board
gh project view

# Create an issue
gh issue create

# Start working on an issue
gh issue develop ISSUE_NUMBER --checkout

# Close an issue
gh issue close ISSUE_NUMBER
```

## Workflow

1. **Pick an issue** from Ready column
2. **Create a branch**: `git checkout -b feature/issue-NUMBER-description`
3. **Move issue** to In Progress
4. **Develop** and commit with conventional commits
5. **Push** and create PR
6. **Move issue** to In Review
7. **Merge** when approved
8. **Issue auto-closes** and moves to Done

## Conventional Commits

Use these prefixes for commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance

Example: `feat(auth): implement user login flow (#3)`

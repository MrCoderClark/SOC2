# GitHub Project Board Setup Guide

Follow these steps to set up your GitHub Project Board for tracking the SOC 2 Compliance Platform development.

## 1. Create the Repository

```bash
cd d:\Code\soc2
git init
git add .
git commit -m "Initial commit: Project structure and tracking setup"
```

Push to GitHub:
```bash
gh repo create soc2-compliance-platform --private --source=. --push
```

Or create manually on GitHub and push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/soc2-compliance-platform.git
git push -u origin main
```

## 2. Set Up Labels

Install the GitHub CLI label importer or manually create labels from `.github/labels.yml`.

Using GitHub CLI:
```bash
# Install github-label-sync
npm install -g github-label-sync

# Sync labels (requires GITHUB_TOKEN)
github-label-sync --access-token YOUR_TOKEN --labels .github/labels.yml YOUR_USERNAME/soc2-compliance-platform
```

## 3. Create Milestones

Create these milestones in GitHub (Settings → Milestones):

| Milestone | Due Date | Description |
|-----------|----------|-------------|
| v0.1.0 - Foundation | Week 3 | Phase 1: Core infrastructure and setup |
| v0.2.0 - Core Features | Week 8 | Phase 2: Basic compliance tracking |
| v0.3.0 - Integrations | Week 14 | Phase 3: Third-party integrations |
| v0.4.0 - AI Features | Week 20 | Phase 4: AI-powered automation |
| v1.0.0 - Enterprise | Week 26 | Phase 5: Enterprise features |

## 4. Create Project Board

1. Go to your repository → Projects → New Project
2. Choose "Board" template
3. Name it "SOC 2 Compliance Platform Development"
4. Create these columns:
   - **Backlog** - All planned work
   - **Ready** - Refined and ready to start
   - **In Progress** - Currently being worked on
   - **In Review** - PR submitted
   - **Done** - Completed

## 5. Import Issues

Create issues from the markdown files in `.github/issues/`:

- `phase-1-issues.md` - 7 issues for Foundation
- `phase-2-issues.md` - 8 issues for Core Features
- `phase-3-issues.md` - 7 issues for Integrations
- `phase-4-issues.md` - 6 issues for AI Features
- `phase-5-issues.md` - 7 issues for Enterprise

**Total: 35 issues**

You can create issues manually or use the GitHub CLI:
```bash
gh issue create --title "[TASK] Initialize Monorepo Structure" --body "..." --label "phase: 1-foundation,type: task,priority: critical"
```

## 6. Add Issues to Project Board

1. Open each issue
2. Click "Projects" in the sidebar
3. Add to your project board
4. Set status to "Backlog"

## 7. Automation (Optional)

Enable these automations in Project Settings:
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

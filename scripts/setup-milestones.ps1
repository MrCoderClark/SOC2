# GitHub Milestones Setup Script
# Run this after creating your repository

Write-Host "Creating GitHub milestones..." -ForegroundColor Cyan

# Calculate due dates from today
$today = Get-Date
$week3 = $today.AddDays(21).ToString("yyyy-MM-dd")
$week8 = $today.AddDays(56).ToString("yyyy-MM-dd")
$week14 = $today.AddDays(98).ToString("yyyy-MM-dd")
$week20 = $today.AddDays(140).ToString("yyyy-MM-dd")
$week26 = $today.AddDays(182).ToString("yyyy-MM-dd")

Write-Host "Creating milestone: v0.1.0 - Foundation (due $week3)" -ForegroundColor Yellow
gh api repos/:owner/:repo/milestones -f title="v0.1.0 - Foundation" -f description="Phase 1: Core infrastructure and setup" -f due_on="${week3}T23:59:59Z"

Write-Host "Creating milestone: v0.2.0 - Core Features (due $week8)" -ForegroundColor Yellow
gh api repos/:owner/:repo/milestones -f title="v0.2.0 - Core Features" -f description="Phase 2: Basic compliance tracking" -f due_on="${week8}T23:59:59Z"

Write-Host "Creating milestone: v0.3.0 - Integrations (due $week14)" -ForegroundColor Yellow
gh api repos/:owner/:repo/milestones -f title="v0.3.0 - Integrations" -f description="Phase 3: Third-party integrations" -f due_on="${week14}T23:59:59Z"

Write-Host "Creating milestone: v0.4.0 - AI Features (due $week20)" -ForegroundColor Yellow
gh api repos/:owner/:repo/milestones -f title="v0.4.0 - AI Features" -f description="Phase 4: AI-powered automation" -f due_on="${week20}T23:59:59Z"

Write-Host "Creating milestone: v1.0.0 - Enterprise (due $week26)" -ForegroundColor Yellow
gh api repos/:owner/:repo/milestones -f title="v1.0.0 - Enterprise" -f description="Phase 5: Enterprise features" -f due_on="${week26}T23:59:59Z"

Write-Host "`nAll milestones created successfully!" -ForegroundColor Green
Write-Host "View them at: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/milestones" -ForegroundColor Cyan

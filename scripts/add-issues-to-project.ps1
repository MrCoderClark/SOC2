# Add all repository issues to the GitHub Project Board

Write-Host "Adding issues to Project Board..." -ForegroundColor Cyan

$owner = (gh repo view --json owner -q .owner.login)
$repoName = (gh repo view --json name -q .name)

# Get project number from file or prompt
$projectNumberFile = ".\scripts\.project-number"
if (Test-Path $projectNumberFile) {
    $projectNumber = Get-Content $projectNumberFile
    Write-Host "Using project number: $projectNumber" -ForegroundColor Yellow
} else {
    $projectNumber = Read-Host "Enter project number"
}

# Get all open issues
Write-Host "`nFetching issues from $owner/$repoName..." -ForegroundColor Yellow
$issues = gh issue list --repo "$owner/$repoName" --state open --limit 100 --json number,title | ConvertFrom-Json

if ($issues.Count -eq 0) {
    Write-Host "No open issues found." -ForegroundColor Red
    exit
}

Write-Host "Found $($issues.Count) issues to add.`n" -ForegroundColor Green

$added = 0
$failed = 0

foreach ($issue in $issues) {
    Write-Host "Adding issue #$($issue.number): $($issue.title)" -ForegroundColor Yellow
    
    # Get the issue node ID
    $issueUrl = "https://github.com/$owner/$repoName/issues/$($issue.number)"
    
    gh project item-add $projectNumber --owner $owner --url $issueUrl 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        $added++
        Write-Host "  Added successfully" -ForegroundColor Green
    } else {
        $failed++
        Write-Host "  Failed to add" -ForegroundColor Red
    }
    
    # Small delay to avoid rate limiting
    Start-Sleep -Milliseconds 300
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Added: $added issues" -ForegroundColor Green
Write-Host "  Failed: $failed issues" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host "`nView project at: https://github.com/users/$owner/projects/$projectNumber" -ForegroundColor Cyan

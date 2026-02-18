# GitHub Project Board Setup Script
# Creates a project board and links it to the repository

Write-Host "Creating GitHub Project Board..." -ForegroundColor Cyan

$owner = (gh repo view --json owner -q .owner.login)
$repoName = (gh repo view --json name -q .name)

Write-Host "Repository: $owner/$repoName" -ForegroundColor Yellow

# Prompt for project name
$defaultName = "SOC2 Compliance Platform"
$projectName = Read-Host "Enter project name (default: $defaultName)"
if ([string]::IsNullOrWhiteSpace($projectName)) {
    $projectName = $defaultName
}

Write-Host "`nCreating project '$projectName' for owner: $owner" -ForegroundColor Yellow

# Create the project (using GitHub Projects V2)
$projectResult = gh project create --owner $owner --title $projectName --format json 2>&1

if ($LASTEXITCODE -eq 0) {
    $project = $projectResult | ConvertFrom-Json
    Write-Host "`nProject created successfully!" -ForegroundColor Green
    Write-Host "Project URL: $($project.url)" -ForegroundColor Cyan
    Write-Host "Project Number: $($project.number)" -ForegroundColor Cyan
    
    # Save project number for later use
    $project.number | Out-File -FilePath ".\scripts\.project-number" -NoNewline
    Write-Host "`nProject number saved to scripts/.project-number" -ForegroundColor Yellow
    
    # Link project to repository
    Write-Host "`nLinking project to repository $owner/$repoName..." -ForegroundColor Yellow
    gh project link $project.number --owner $owner --repo $repoName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Project linked to repository successfully!" -ForegroundColor Green
        Write-Host "View at: https://github.com/$owner/$repoName/projects" -ForegroundColor Cyan
    } else {
        Write-Host "Failed to link project. You can do it manually in project settings." -ForegroundColor Red
    }
} else {
    Write-Host "Error creating project: $projectResult" -ForegroundColor Red
    Write-Host "`nYou may need to create the project manually:" -ForegroundColor Yellow
    Write-Host "1. Go to https://github.com/users/$owner/projects" -ForegroundColor White
    Write-Host "2. Click 'New project'" -ForegroundColor White
    Write-Host "3. Choose 'Board' template" -ForegroundColor White
    Write-Host "4. Name it and link to $repoName in settings" -ForegroundColor White
}

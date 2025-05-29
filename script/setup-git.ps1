# Git Setup Script for Work Time Tracker

Write-Host "=== Git Repository Setup ===" -ForegroundColor Cyan

# Check if .git directory exists
if (Test-Path ".git") {
    Write-Host "Git repository already initialized" -ForegroundColor Green
}
else {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
}

# Check current remotes
$remotes = git remote -v
if ($remotes) {
    Write-Host "Current remotes:" -ForegroundColor Yellow
    Write-Host $remotes
}
else {
    Write-Host "No remotes configured" -ForegroundColor Yellow
}

# Add or update origin
$repoUrl = "https://github.com/umezawakanta/work-time-tracker.git"
$hasOrigin = git remote | Select-String -Pattern "origin"

if ($hasOrigin) {
    Write-Host "Updating origin URL..." -ForegroundColor Yellow
    git remote set-url origin $repoUrl
}
else {
    Write-Host "Adding origin remote..." -ForegroundColor Yellow
    git remote add origin $repoUrl
}

Write-Host "Remote configuration updated:" -ForegroundColor Green
git remote -v

# Check branch
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan

if ($currentBranch -ne "main") {
    Write-Host "Switching to main branch..." -ForegroundColor Yellow
    git checkout -b main
}

# Git user configuration
$userName = git config user.name
$userEmail = git config user.email

if (-not $userName) {
    $inputName = Read-Host "Enter your Git username"
    git config user.name $inputName
}

if (-not $userEmail) {
    $inputEmail = Read-Host "Enter your Git email"
    git config user.email $inputEmail
}

Write-Host ""
Write-Host "Git configuration:" -ForegroundColor Green
Write-Host "Repository: $repoUrl" -ForegroundColor White
Write-Host "Branch: main" -ForegroundColor White
Write-Host "User: $(git config user.name) <$(git config user.email)>" -ForegroundColor White

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Stage your changes: git add ." -ForegroundColor White
Write-Host "2. Commit: git commit -m 'Your message'" -ForegroundColor White
Write-Host "3. Push: git push -u origin main" -ForegroundColor White
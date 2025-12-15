# AI Learning Companion Launcher
# Right-click and "Run with PowerShell"

# Set window title
$host.UI.RawUI.WindowTitle = "aria"

# Change to script directory
Set-Location $PSScriptRoot

# Clear screen
Clear-Host

Write-Host ""
Write-Host "aria" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install from https://nodejs.org" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if dependencies are installed
if (!(Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "First time setup: Installing dependencies..." -ForegroundColor Yellow
    Write-Host ""
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "Failed to install dependencies!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host " app..." -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 1

# Run the app
node app.js

# Keep window open if there is an error
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "An error occurred!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
}
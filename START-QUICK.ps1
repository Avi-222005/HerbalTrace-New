# Quick Start - Just start existing containers (no redeploy)
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  QUICK START - HerbalTrace" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan

# Check Docker
Write-Host "`nChecking Docker..." -NoNewline
try {
    docker ps | Out-Null
    Write-Host " OK" -ForegroundColor Green
} catch {
    Write-Host " NOT RUNNING" -ForegroundColor Red
    Write-Host "Please start Docker Desktop first!" -ForegroundColor Yellow
    exit 1
}

# Start blockchain containers
Write-Host "`nStarting blockchain containers..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\network"
docker compose -f docker/docker-compose-herbaltrace.yaml start

# Wait for containers to be ready
Write-Host "`nWaiting for peers to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Show status
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  BLOCKCHAIN STARTED" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}" | Select-String -Pattern "peer|orderer"

Write-Host "`n✅ Now start the backend:" -ForegroundColor Green
Write-Host "   cd d:\Graph\HerbalTrace\backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White

Set-Location $PSScriptRoot

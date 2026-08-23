param(
  [ValidateSet('full','app-only')]
  [string]$Mode = 'full',
  [switch]$RunE2E,
  [switch]$FreshStart
)

$ErrorActionPreference = 'Stop'

function Write-Step($msg) {
  Write-Host "`n==> $msg" -ForegroundColor Cyan
}

function Write-Info($msg) {
  Write-Host "  $msg" -ForegroundColor Gray
}

function Write-Ok($msg) {
  Write-Host "  $msg" -ForegroundColor Green
}

function Write-Warn($msg) {
  Write-Host "  $msg" -ForegroundColor Yellow
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root 'backend'
$networkDir = Join-Path $root 'network'

Write-Host "HerbalTrace Portable Startup" -ForegroundColor Green
Write-Host "Mode: $Mode" -ForegroundColor Green
Write-Host "Root: $root" -ForegroundColor Green
Write-Host "FreshStart: $FreshStart" -ForegroundColor Green

Write-Step 'Checking prerequisites'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw 'Node.js is not installed or not in PATH.'
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw 'npm is not installed or not in PATH.'
}
Write-Ok "Node: $(node --version)"
Write-Ok "npm: $(npm --version)"

if ($Mode -eq 'full') {
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw 'Docker CLI not found. Install Docker Desktop first.'
  }
  docker ps | Out-Null
  Write-Ok 'Docker daemon is running.'

  if (-not (Get-Command bash -ErrorAction SilentlyContinue)) {
    throw 'bash is required for network scripts (Git Bash or WSL bash).'
  }
  Write-Ok 'bash found for network scripts.'
}

Write-Step 'Installing backend dependencies'
Push-Location $backendDir
npm install

if ($FreshStart) {
  Write-Step 'Resetting application data for fresh start'
  node .\reset-fresh-start.js
  if ($LASTEXITCODE -ne 0) {
    throw 'Fresh start reset failed.'
  }
  Write-Ok 'Application data reset completed.'
}

Pop-Location
Write-Ok 'Backend dependencies installed.'

if ($Mode -eq 'full') {
  Write-Step 'Starting Fabric network'
  Push-Location $networkDir
  bash ./deploy-network.sh up -ca
  if ($LASTEXITCODE -ne 0) {
    throw 'Failed to start Fabric network.'
  }

  Write-Step 'Creating/ensuring channel'
  bash ./scripts/create-channel-v2.sh
  if ($LASTEXITCODE -ne 0) {
    Write-Warn 'Channel creation script returned a non-zero code. If channel already exists, this can be ignored.'
  } else {
    Write-Ok 'Channel ensured.'
  }
  Pop-Location
}

Write-Step 'Starting backend API'
$backendCmd = "Set-Location '$backendDir'; npm run dev"
Start-Process powershell -ArgumentList '-NoExit', '-Command', $backendCmd | Out-Null
Start-Sleep -Seconds 5

try {
  $health = Invoke-RestMethod -Uri 'http://localhost:3000/health' -Method GET
  Write-Ok "Backend healthy: $($health.status)"
} catch {
  Write-Warn 'Backend health check failed. The API may still be starting; check opened terminal window.'
}

if ($RunE2E) {
  Write-Step 'Running full end-to-end smoke test'
  Push-Location $backendDir
  node .\tmp-full-registration-to-consumer-test.js
  Pop-Location
}

Write-Host "`nStartup completed." -ForegroundColor Green
Write-Host 'Next useful commands:' -ForegroundColor Cyan
Write-Host "  Backend health: Invoke-RestMethod http://localhost:3000/health" -ForegroundColor White
Write-Host "  Full E2E test:  cd '$backendDir'; node .\tmp-full-registration-to-consumer-test.js" -ForegroundColor White
Write-Host "  Stop network:   cd '$networkDir'; bash ./deploy-network.sh down" -ForegroundColor White

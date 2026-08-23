# Start Complete Blockchain Network with Docker
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  STARTING HYPERLEDGER FABRIC NETWORK" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$networkDir = Join-Path $root "network"

# Check Docker
Write-Host "Checking Docker..." -NoNewline
try {
    $dockerVersion = docker --version
    Write-Host " OK" -ForegroundColor Green
    Write-Host "  $dockerVersion" -ForegroundColor Gray
} catch {
    Write-Host " FAILED" -ForegroundColor Red
    Write-Host "Docker is required. Please install Docker Desktop." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Checking Docker daemon..." -NoNewline
try {
    docker ps | Out-Null
    Write-Host " RUNNING" -ForegroundColor Green
} catch {
    Write-Host " NOT RUNNING" -ForegroundColor Red
    Write-Host "Please start Docker Desktop first." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  DEPLOYING BLOCKCHAIN NETWORK" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to network directory
Set-Location -Path $networkDir

Write-Host "Step 1: Cleaning up any existing network..." -ForegroundColor Cyan
bash ./deploy-network.sh down

Write-Host ""
Write-Host "Step 2: Starting Fabric network (this takes 2-3 minutes)..." -ForegroundColor Cyan
Write-Host "  - Starting orderer nodes" -ForegroundColor Gray
Write-Host "  - Starting peer nodes for all organizations" -ForegroundColor Gray
Write-Host "  - Starting CouchDB instances" -ForegroundColor Gray
Write-Host ""

bash ./deploy-network.sh up -ca

Write-Host ""
Write-Host "Step 3: Creating channel..." -ForegroundColor Cyan
bash ./deploy-network.sh createChannel

Write-Host ""
Write-Host "Step 4: Deploying chaincode..." -ForegroundColor Cyan
bash ./deploy-network.sh deployChaincode

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  BLOCKCHAIN NETWORK READY!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check running containers
Write-Host "Running Docker Containers:" -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Select-String -Pattern "peer|orderer|ca|couchdb"

Write-Host ""
Write-Host "Network Endpoints:" -ForegroundColor Yellow
Write-Host "  Orderer:           localhost:7050" -ForegroundColor White
Write-Host "  Peer0.FarmerOrg:   localhost:7051" -ForegroundColor White
Write-Host "  Peer0.AdminOrg:    localhost:9051" -ForegroundColor White
Write-Host "  Peer0.LabOrg:      localhost:11051" -ForegroundColor White
Write-Host "  Peer0.ProcessorOrg: localhost:13051" -ForegroundColor White
Write-Host ""

Write-Host "CouchDB Instances:" -ForegroundColor Yellow
Write-Host "  FarmerOrg:    http://localhost:5984" -ForegroundColor White
Write-Host "  AdminOrg:     http://localhost:7984" -ForegroundColor White
Write-Host "  LabOrg:       http://localhost:9984" -ForegroundColor White
Write-Host "  ProcessorOrg: http://localhost:11984" -ForegroundColor White
Write-Host ""

# Go back to main directory
Set-Location -Path $root

Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Blockchain network is now running!" -ForegroundColor Green
Write-Host "Backend and Web Portal should now use real blockchain transactions." -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop the network: cd network; bash ./deploy-network.sh down" -ForegroundColor Gray
Write-Host ""

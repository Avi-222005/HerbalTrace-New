# Deploy HerbalTrace Chaincode - Windows PowerShell Script
# This script deploys the chaincode using Docker commands

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploying HerbalTrace Chaincode" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$CHANNEL_NAME = "herbaltrace-channel"
$CC_NAME = "herbaltrace"
$CC_VERSION = "1.0"
$CC_SEQUENCE = 1
$CC_PATH = "/opt/gopath/src/github.com/chaincode/herbaltrace"

# Step 1: Package chaincode
Write-Host "[1/6] Packaging chaincode..." -ForegroundColor Yellow
docker exec cli peer lifecycle chaincode package ${CC_NAME}.tar.gz `
    --path ${CC_PATH} `
    --lang golang `
    --label ${CC_NAME}_${CC_VERSION}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Chaincode packaged successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to package chaincode" -ForegroundColor Red
    exit 1
}

# Step 2: Install on Farmers peer
Write-Host ""
Write-Host "[2/6] Installing on Farmers peer..." -ForegroundColor Yellow
docker exec `
    -e CORE_PEER_LOCALMSPID=FarmersMSP `
    -e CORE_PEER_ADDRESS=peer0.farmers.herbaltrace.com:7051 `
    -e CORE_PEER_TLS_ENABLED=true `
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt `
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/users/Admin@farmers.herbaltrace.com/msp `
    cli peer lifecycle chaincode install ${CC_NAME}.tar.gz

Write-Host "✅ Installed on Farmers" -ForegroundColor Green

# Step 3: Install on Labs peer
Write-Host ""
Write-Host "[3/6] Installing on Labs peer..." -ForegroundColor Yellow
docker exec `
    -e CORE_PEER_LOCALMSPID=LabsMSP `
    -e CORE_PEER_ADDRESS=peer0.labs.herbaltrace.com:9051 `
    -e CORE_PEER_TLS_ENABLED=true `
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/labs.herbaltrace.com/peers/peer0.labs.herbaltrace.com/tls/ca.crt `
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/labs.herbaltrace.com/users/Admin@labs.herbaltrace.com/msp `
    cli peer lifecycle chaincode install ${CC_NAME}.tar.gz

Write-Host "✅ Installed on Labs" -ForegroundColor Green

# Step 4: Install on Processors peer
Write-Host ""
Write-Host "[4/6] Installing on Processors peer..." -ForegroundColor Yellow
docker exec `
    -e CORE_PEER_LOCALMSPID=ProcessorsMSP `
    -e CORE_PEER_ADDRESS=peer0.processors.herbaltrace.com:11051 `
    -e CORE_PEER_TLS_ENABLED=true `
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/peers/peer0.processors.herbaltrace.com/tls/ca.crt `
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/users/Admin@processors.herbaltrace.com/msp `
    cli peer lifecycle chaincode install ${CC_NAME}.tar.gz

Write-Host "✅ Installed on Processors" -ForegroundColor Green

# Step 5: Install on Manufacturers peer
Write-Host ""
Write-Host "[5/6] Installing on Manufacturers peer..." -ForegroundColor Yellow
docker exec `
    -e CORE_PEER_LOCALMSPID=ManufacturersMSP `
    -e CORE_PEER_ADDRESS=peer0.manufacturers.herbaltrace.com:13051 `
    -e CORE_PEER_TLS_ENABLED=true `
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/manufacturers.herbaltrace.com/peers/peer0.manufacturers.herbaltrace.com/tls/ca.crt `
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/manufacturers.herbaltrace.com/users/Admin@manufacturers.herbaltrace.com/msp `
    cli peer lifecycle chaincode install ${CC_NAME}.tar.gz

Write-Host "✅ Installed on Manufacturers" -ForegroundColor Green

# Step 6: Get package ID
Write-Host ""
Write-Host "[6/6] Getting package ID..." -ForegroundColor Yellow
$packageId = docker exec cli peer lifecycle chaincode queryinstalled | Select-String "${CC_NAME}_${CC_VERSION}" | ForEach-Object { $_.ToString().Split(",")[0].Split(":")[1].Trim() }

Write-Host "Package ID: $packageId" -ForegroundColor Cyan

# Step 7: Approve for each org
Write-Host ""
Write-Host "Approving chaincode for each organization..." -ForegroundColor Yellow

# Approve for Farmers
Write-Host "  Approving for Farmers..." -ForegroundColor Gray
docker exec `
    -e CORE_PEER_LOCALMSPID=FarmersMSP `
    -e CORE_PEER_ADDRESS=peer0.farmers.herbaltrace.com:7051 `
    -e CORE_PEER_TLS_ENABLED=true `
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt `
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/users/Admin@farmers.herbaltrace.com/msp `
    cli peer lifecycle chaincode approveformyorg `
    -o orderer.herbaltrace.com:7050 `
    --ordererTLSHostnameOverride orderer.herbaltrace.com `
    --tls `
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem `
    --channelID $CHANNEL_NAME `
    --name $CC_NAME `
    --version $CC_VERSION `
    --package-id $packageId `
    --sequence $CC_SEQUENCE

# Approve for Labs
Write-Host "  Approving for Labs..." -ForegroundColor Gray
docker exec `
    -e CORE_PEER_LOCALMSPID=LabsMSP `
    -e CORE_PEER_ADDRESS=peer0.labs.herbaltrace.com:9051 `
    -e CORE_PEER_TLS_ENABLED=true `
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/labs.herbaltrace.com/peers/peer0.labs.herbaltrace.com/tls/ca.crt `
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/labs.herbaltrace.com/users/Admin@labs.herbaltrace.com/msp `
    cli peer lifecycle chaincode approveformyorg `
    -o orderer.herbaltrace.com:7050 `
    --ordererTLSHostnameOverride orderer.herbaltrace.com `
    --tls `
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem `
    --channelID $CHANNEL_NAME `
    --name $CC_NAME `
    --version $CC_VERSION `
    --package-id $packageId `
    --sequence $CC_SEQUENCE

# Approve for Processors
Write-Host "  Approving for Processors..." -ForegroundColor Gray
docker exec `
    -e CORE_PEER_LOCALMSPID=ProcessorsMSP `
    -e CORE_PEER_ADDRESS=peer0.processors.herbaltrace.com:11051 `
    -e CORE_PEER_TLS_ENABLED=true `
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/peers/peer0.processors.herbaltrace.com/tls/ca.crt `
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/users/Admin@processors.herbaltrace.com/msp `
    cli peer lifecycle chaincode approveformyorg `
    -o orderer.herbaltrace.com:7050 `
    --ordererTLSHostnameOverride orderer.herbaltrace.com `
    --tls `
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem `
    --channelID $CHANNEL_NAME `
    --name $CC_NAME `
    --version $CC_VERSION `
    --package-id $packageId `
    --sequence $CC_SEQUENCE

# Approve for Manufacturers
Write-Host "  Approving for Manufacturers..." -ForegroundColor Gray
docker exec `
    -e CORE_PEER_LOCALMSPID=ManufacturersMSP `
    -e CORE_PEER_ADDRESS=peer0.manufacturers.herbaltrace.com:13051 `
    -e CORE_PEER_TLS_ENABLED=true `
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/manufacturers.herbaltrace.com/peers/peer0.manufacturers.herbaltrace.com/tls/ca.crt `
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/manufacturers.herbaltrace.com/users/Admin@manufacturers.herbaltrace.com/msp `
    cli peer lifecycle chaincode approveformyorg `
    -o orderer.herbaltrace.com:7050 `
    --ordererTLSHostnameOverride orderer.herbaltrace.com `
    --tls `
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem `
    --channelID $CHANNEL_NAME `
    --name $CC_NAME `
    --version $CC_VERSION `
    --package-id $packageId `
    --sequence $CC_SEQUENCE

Write-Host "✅ All organizations approved" -ForegroundColor Green

# Step 8: Check commit readiness
Write-Host ""
Write-Host "Checking commit readiness..." -ForegroundColor Yellow
docker exec cli peer lifecycle chaincode checkcommitreadiness `
    --channelID $CHANNEL_NAME `
    --name $CC_NAME `
    --version $CC_VERSION `
    --sequence $CC_SEQUENCE `
    --output json

# Step 9: Commit chaincode
Write-Host ""
Write-Host "Committing chaincode definition..." -ForegroundColor Yellow
docker exec `
    -e CORE_PEER_LOCALMSPID=FarmersMSP `
    -e CORE_PEER_ADDRESS=peer0.farmers.herbaltrace.com:7051 `
    -e CORE_PEER_TLS_ENABLED=true `
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt `
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/users/Admin@farmers.herbaltrace.com/msp `
    cli peer lifecycle chaincode commit `
    -o orderer.herbaltrace.com:7050 `
    --ordererTLSHostnameOverride orderer.herbaltrace.com `
    --tls `
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem `
    --channelID $CHANNEL_NAME `
    --name $CC_NAME `
    --version $CC_VERSION `
    --sequence $CC_SEQUENCE `
    --peerAddresses peer0.farmers.herbaltrace.com:7051 `
    --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt `
    --peerAddresses peer0.labs.herbaltrace.com:9051 `
    --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/labs.herbaltrace.com/peers/peer0.labs.herbaltrace.com/tls/ca.crt `
    --peerAddresses peer0.processors.herbaltrace.com:11051 `
    --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/peers/peer0.processors.herbaltrace.com/tls/ca.crt `
    --peerAddresses peer0.manufacturers.herbaltrace.com:13051 `
    --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/manufacturers.herbaltrace.com/peers/peer0.manufacturers.herbaltrace.com/tls/ca.crt

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ CHAINCODE DEPLOYED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "You can now create collections and they will sync to blockchain!" -ForegroundColor Cyan

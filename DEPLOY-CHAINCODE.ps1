# ==========================================
# Complete Chaincode Deployment Script (PowerShell)
# ==========================================

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "   HerbalTrace Chaincode Deployment" -ForegroundColor Green
Write-Host "==========================================`n" -ForegroundColor Cyan

$PACKAGE_ID = "herbaltrace_1.0:92f4668edb6720e317ac5d237a1cf1e904c5e49e55e9855817841ac04e879844"
$CHANNEL_NAME = "herbaltrace-channel"
$CC_NAME = "herbaltrace"
$CC_VERSION = "1.0"
$CC_SEQUENCE = 1

Write-Host "[1/3] Approving chaincode for Farmers organization...`n" -ForegroundColor Yellow

docker exec -e CORE_PEER_LOCALMSPID=FarmersMSP -e CORE_PEER_ADDRESS=peer0.farmers.herbaltrace.com:7051 -e CORE_PEER_TLS_ENABLED=true -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/users/Admin@farmers.herbaltrace.com/msp cli peer lifecycle chaincode approveformyorg -o orderer.herbaltrace.com:7050 --ordererTLSHostnameOverride orderer.herbaltrace.com --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem --channelID $CHANNEL_NAME --name $CC_NAME --version $CC_VERSION --package-id $PACKAGE_ID --sequence $CC_SEQUENCE

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nERROR: Approval failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Chaincode approved successfully!`n" -ForegroundColor Green
Write-Host "[2/3] Committing chaincode to channel...`n" -ForegroundColor Yellow

docker exec -e CORE_PEER_LOCALMSPID=FarmersMSP -e CORE_PEER_ADDRESS=peer0.farmers.herbaltrace.com:7051 -e CORE_PEER_TLS_ENABLED=true -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/users/Admin@farmers.herbaltrace.com/msp cli peer lifecycle chaincode commit -o orderer.herbaltrace.com:7050 --ordererTLSHostnameOverride orderer.herbaltrace.com --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem --channelID $CHANNEL_NAME --name $CC_NAME --version $CC_VERSION --sequence $CC_SEQUENCE --peerAddresses peer0.farmers.herbaltrace.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nERROR: Commit failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Chaincode committed successfully!`n" -ForegroundColor Green
Write-Host "[3/3] Verifying deployment...`n" -ForegroundColor Yellow

docker exec cli peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name $CC_NAME

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "   ✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "==========================================`n" -ForegroundColor Green

Write-Host "Your HerbalTrace blockchain is ready!`n" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run QUICK-START.bat to start backend and frontend" -ForegroundColor White
Write-Host "  2. Access web portal at http://localhost:5173`n" -ForegroundColor White

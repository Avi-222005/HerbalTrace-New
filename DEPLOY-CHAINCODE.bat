@echo off
REM ==========================================
REM Complete Chaincode Deployment Script
REM ==========================================

echo.
echo ==========================================
echo   HerbalTrace Chaincode Deployment
echo ==========================================
echo.

SET PACKAGE_ID=herbaltrace_1.0:92f4668edb6720e317ac5d237a1cf1e904c5e49e55e9855817841ac04e879844
SET CHANNEL_NAME=herbaltrace-channel
SET CC_NAME=herbaltrace
SET CC_VERSION=1.0
SET CC_SEQUENCE=1

echo [1/3] Approving chaincode for Farmers organization...
echo.

docker exec -e CORE_PEER_LOCALMSPID=FarmersMSP -e CORE_PEER_ADDRESS=peer0.farmers.herbaltrace.com:7051 -e CORE_PEER_TLS_ENABLED=true -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/users/Admin@farmers.herbaltrace.com/msp cli peer lifecycle chaincode approveformyorg -o orderer.herbaltrace.com:7050 --ordererTLSHostnameOverride orderer.herbaltrace.com --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem --channelID %CHANNEL_NAME% --name %CC_NAME% --version %CC_VERSION% --package-id %PACKAGE_ID% --sequence %CC_SEQUENCE%

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Approval failed!
    pause
    exit /b 1
)

echo.
echo ✅ Chaincode approved successfully!
echo.
echo [2/3] Committing chaincode to channel...
echo.

docker exec -e CORE_PEER_LOCALMSPID=FarmersMSP -e CORE_PEER_ADDRESS=peer0.farmers.herbaltrace.com:7051 -e CORE_PEER_TLS_ENABLED=true -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/users/Admin@farmers.herbaltrace.com/msp cli peer lifecycle chaincode commit -o orderer.herbaltrace.com:7050 --ordererTLSHostnameOverride orderer.herbaltrace.com --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem --channelID %CHANNEL_NAME% --name %CC_NAME% --version %CC_VERSION% --sequence %CC_SEQUENCE% --peerAddresses peer0.farmers.herbaltrace.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Commit failed!
    pause
    exit /b 1
)

echo.
echo ✅ Chaincode committed successfully!
echo.
echo [3/3] Verifying deployment...
echo.

docker exec cli peer lifecycle chaincode querycommitted --channelID %CHANNEL_NAME% --name %CC_NAME%

echo.
echo ==========================================
echo   ✅ DEPLOYMENT COMPLETE!
echo ==========================================
echo.
echo Your HerbalTrace blockchain is ready!
echo.
echo Next steps:
echo   1. Run QUICK-START.bat to start backend and frontend
echo   2. Access web portal at http://localhost:5173
echo.
pause

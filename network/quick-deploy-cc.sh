#!/bin/bash
# Approve and commit chaincode for HerbalTrace
# Using only Farmers org since chaincode is already installed there

PACKAGE_ID="herbaltrace_1.0:92f4668edb6720e317ac5d237a1cf1e904c5e49e55e9855817841ac04e879844"
CHANNEL_NAME="herbaltrace-channel"
CC_NAME="herbaltrace"
CC_VERSION="1.0"
CC_SEQUENCE=1

echo ""
echo "======================================"
echo "Approving Chaincode for Farmers"
echo "======================================"
echo ""

# Approve for Farmers
docker exec \
  -e CORE_PEER_LOCALMSPID="FarmersMSP" \
  -e CORE_PEER_ADDRESS="peer0.farmers.herbaltrace.com:7051" \
  -e CORE_PEER_TLS_ENABLED=true \
  -e CORE_PEER_TLS_ROOTCERT_FILE="/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt" \
  -e CORE_PEER_MSPCONFIGPATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/users/Admin@farmers.herbaltrace.com/msp" \
  cli peer lifecycle chaincode approveformyorg \
  -o orderer.herbaltrace.com:7050 \
  --ordererTLSHostnameOverride orderer.herbaltrace.com \
  --tls \
  --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem \
  --channelID $CHANNEL_NAME \
  --name $CC_NAME \
  --version $CC_VERSION \
  --package-id $PACKAGE_ID \
  --sequence $CC_SEQUENCE

echo ""
echo "✅ Farmers approved!"
echo ""

# Check commit readiness
echo "Checking commit readiness..."
docker exec \
  -e CORE_PEER_LOCALMSPID="FarmersMSP" \
  -e CORE_PEER_ADDRESS="peer0.farmers.herbaltrace.com:7051" \
  -e CORE_PEER_TLS_ENABLED=true \
  -e CORE_PEER_TLS_ROOTCERT_FILE="/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt" \
  -e CORE_PEER_MSPCONFIGPATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/users/Admin@farmers.herbaltrace.com/msp" \
  cli peer lifecycle chaincode checkcommitreadiness \
  --channelID $CHANNEL_NAME \
  --name $CC_NAME \
  --version $CC_VERSION \
  --sequence $CC_SEQUENCE \
  --output json

echo ""
echo "======================================"
echo "Committing Chaincode"
echo "======================================"
echo ""

# Commit chaincode
docker exec \
  -e CORE_PEER_LOCALMSPID="FarmersMSP" \
  -e CORE_PEER_ADDRESS="peer0.farmers.herbaltrace.com:7051" \
  -e CORE_PEER_TLS_ENABLED=true \
  -e CORE_PEER_TLS_ROOTCERT_FILE="/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt" \
  -e CORE_PEER_MSPCONFIGPATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/users/Admin@farmers.herbaltrace.com/msp" \
  cli peer lifecycle chaincode commit \
  -o orderer.herbaltrace.com:7050 \
  --ordererTLSHostnameOverride orderer.herbaltrace.com \
  --tls \
  --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem \
  --channelID $CHANNEL_NAME \
  --name $CC_NAME \
  --version $CC_VERSION \
  --sequence $CC_SEQUENCE \
  --peerAddresses peer0.farmers.herbaltrace.com:7051 \
  --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt

if [ $? -eq 0 ]; then
  echo ""
  echo "======================================"
  echo "✅ CHAINCODE COMMITTED SUCCESSFULLY!"
  echo "======================================"
  echo ""
  echo "✅ Your HerbalTrace blockchain is ready!"
  echo ""
  echo "Next steps:"
  echo "  1. Start backend: cd backend && npm run dev"
  echo "  2. Start frontend: cd web-portal && npm run dev"
  echo "  3. Access: http://localhost:5173"
  echo ""
  exit 0
else
  echo ""
  echo "❌ Commit failed"
  exit 1
fi

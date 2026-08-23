#!/bin/bash
# Quick chaincode approval and commit
# Chaincode is already installed, just need to approve and commit

CHANNEL_NAME="herbaltrace-channel"
CC_NAME="herbaltrace"
CC_VERSION="1.0"
CC_SEQUENCE=1
PACKAGE_ID="herbaltrace_1.0:92f4668edb6720e317ac5d237a1cf1e904c5e49e55e9855817841ac04e879844"

echo "======================================"
echo "Approving and Committing Chaincode"
echo "======================================"
echo "Package ID: $PACKAGE_ID"
echo ""

# Set peer to Farmers for operations
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="FarmersMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/users/Admin@farmers.herbaltrace.com/msp
export CORE_PEER_ADDRESS=peer0.farmers.herbaltrace.com:7051

echo "[1/5] Approving for Farmers..."
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
echo "[2/5] Approving for Labs..."
docker exec \
  -e CORE_PEER_LOCALMSPID="LabsMSP" \
  -e CORE_PEER_ADDRESS="peer0.labs.herbaltrace.com:9051" \
  -e CORE_PEER_TLS_ENABLED=true \
  -e CORE_PEER_TLS_ROOTCERT_FILE="/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/labs.herbaltrace.com/peers/peer0.labs.herbaltrace.com/tls/ca.crt" \
  -e CORE_PEER_MSPCONFIGPATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/labs.herbaltrace.com/users/Admin@labs.herbaltrace.com/msp" \
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
echo "[3/5] Approving for Processors..."
docker exec \
  -e CORE_PEER_LOCALMSPID="ProcessorsMSP" \
  -e CORE_PEER_ADDRESS="peer0.processors.herbaltrace.com:11051" \
  -e CORE_PEER_TLS_ENABLED=true \
  -e CORE_PEER_TLS_ROOTCERT_FILE="/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/peers/peer0.processors.herbaltrace.com/tls/ca.crt" \
  -e CORE_PEER_MSPCONFIGPATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/users/Admin@processors.herbaltrace.com/msp" \
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
echo "[4/5] Approving for Manufacturers..."
docker exec \
  -e CORE_PEER_LOCALMSPID="ManufacturersMSP" \
  -e CORE_PEER_ADDRESS="peer0.manufacturers.herbaltrace.com:13051" \
  -e CORE_PEER_TLS_ENABLED=true \
  -e CORE_PEER_TLS_ROOTCERT_FILE="/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/manufacturers.herbaltrace.com/peers/peer0.manufacturers.herbaltrace.com/tls/ca.crt" \
  -e CORE_PEER_MSPCONFIGPATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/manufacturers.herbaltrace.com/users/Admin@manufacturers.herbaltrace.com/msp" \
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
echo "[5/5] Checking commit readiness..."
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
echo "Committing chaincode to channel..."
echo "======================================"

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
  --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt \
  --peerAddresses peer0.labs.herbaltrace.com:9051 \
  --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/labs.herbaltrace.com/peers/peer0.labs.herbaltrace.com/tls/ca.crt \
  --peerAddresses peer0.processors.herbaltrace.com:11051 \
  --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/peers/peer0.processors.herbaltrace.com/tls/ca.crt \
  --peerAddresses peer0.manufacturers.herbaltrace.com:13051 \
  --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/manufacturers.herbaltrace.com/peers/peer0.manufacturers.herbaltrace.com/tls/ca.crt

if [ $? -eq 0 ]; then
  echo ""
  echo "======================================"
  echo "✅ CHAINCODE COMMITTED SUCCESSFULLY!"
  echo "======================================"
  echo ""
  echo "Chaincode Details:"
  echo "  Name: $CC_NAME"
  echo "  Version: $CC_VERSION"
  echo "  Sequence: $CC_SEQUENCE"
  echo "  Channel: $CHANNEL_NAME"
  echo ""
  echo "You can now start the backend and frontend!"
  exit 0
else
  echo ""
  echo "======================================"
  echo "❌ CHAINCODE COMMIT FAILED"
  echo "======================================"
  exit 1
fi

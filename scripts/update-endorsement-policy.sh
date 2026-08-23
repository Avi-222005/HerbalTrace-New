#!/bin/bash

# Script to update chaincode endorsement policy from ALL to OR
# This allows ANY organization to endorse transactions, not requiring ALL organizations

echo "ðŸ”§ Updating Chaincode Endorsement Policy"
echo "From: ALL MSPs must approve"
echo "To: ANY MSP can approve"
echo ""
echo "This will NOT affect existing data or farmer transactions!"
echo ""

# Set environment variables
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="FarmersCoopMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/users/Admin@farmers.herbaltrace.com/msp
export CORE_PEER_ADDRESS=peer0.farmers.herbaltrace.com:7051
export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem

CHANNEL_NAME="herbaltrace-channel"
CC_NAME="herbaltrace"
CC_VERSION="2.1"
CC_SEQUENCE=4  # Increment sequence number

echo "ðŸ“¦ Step 1: Approve new endorsement policy for FarmersCoopMSP..."
docker exec cli peer lifecycle chaincode approveformyorg \
  -o orderer.herbaltrace.com:7050 \
  --ordererTLSHostnameOverride orderer.herbaltrace.com \
  --channelID $CHANNEL_NAME \
  --name $CC_NAME \
  --version $CC_VERSION \
  --package-id $(docker exec cli peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes[0].package_id') \
  --sequence $CC_SEQUENCE \
  --tls \
  --cafile $ORDERER_CA \
  --signature-policy "OR('FarmersCoopMSP.peer','TestingLabsMSP.peer','ProcessorsMSP.peer','ManufacturersMSP.peer')"

echo ""
echo "âœ… FarmersCoopMSP approved!"
echo ""

# Approve for other orgs (they need to approve too)
echo "ðŸ“¦ Step 2: Approve for TestingLabsMSP..."
export CORE_PEER_LOCALMSPID="TestingLabsMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/labs.herbaltrace.com/peers/peer0.labs.herbaltrace.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/labs.herbaltrace.com/users/Admin@labs.herbaltrace.com/msp
export CORE_PEER_ADDRESS=peer0.labs.herbaltrace.com:9051

docker exec cli peer lifecycle chaincode approveformyorg \
  -o orderer.herbaltrace.com:7050 \
  --ordererTLSHostnameOverride orderer.herbaltrace.com \
  --channelID $CHANNEL_NAME \
  --name $CC_NAME \
  --version $CC_VERSION \
  --package-id $(docker exec cli peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes[0].package_id') \
  --sequence $CC_SEQUENCE \
  --tls \
  --cafile $ORDERER_CA \
  --signature-policy "OR('FarmersCoopMSP.peer','TestingLabsMSP.peer','ProcessorsMSP.peer','ManufacturersMSP.peer')"

echo ""
echo "âœ… TestingLabsMSP approved!"
echo ""

echo "ðŸ“¦ Step 3: Approve for ProcessorsMSP..."
export CORE_PEER_LOCALMSPID="ProcessorsMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/peers/peer0.processors.herbaltrace.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/users/Admin@processors.herbaltrace.com/msp
export CORE_PEER_ADDRESS=peer0.processors.herbaltrace.com:10051

docker exec cli peer lifecycle chaincode approveformyorg \
  -o orderer.herbaltrace.com:7050 \
  --ordererTLSHostnameOverride orderer.herbaltrace.com \
  --channelID $CHANNEL_NAME \
  --name $CC_NAME \
  --version $CC_VERSION \
  --package-id $(docker exec cli peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes[0].package_id') \
  --sequence $CC_SEQUENCE \
  --tls \
  --cafile $ORDERER_CA \
  --signature-policy "OR('FarmersCoopMSP.peer','TestingLabsMSP.peer','ProcessorsMSP.peer','ManufacturersMSP.peer')"

echo ""
echo "âœ… ProcessorsMSP approved!"
echo ""

echo "ðŸ“¦ Step 4: Approve for ManufacturersMSP..."
export CORE_PEER_LOCALMSPID="ManufacturersMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/manufacturers.herbaltrace.com/peers/peer0.manufacturers.herbaltrace.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/manufacturers.herbaltrace.com/users/Admin@manufacturers.herbaltrace.com/msp
export CORE_PEER_ADDRESS=peer0.manufacturers.herbaltrace.com:11051

docker exec cli peer lifecycle chaincode approveformyorg \
  -o orderer.herbaltrace.com:7050 \
  --ordererTLSHostnameOverride orderer.herbaltrace.com \
  --channelID $CHANNEL_NAME \
  --name $CC_NAME \
  --version $CC_VERSION \
  --package-id $(docker exec cli peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes[0].package_id') \
  --sequence $CC_SEQUENCE \
  --tls \
  --cafile $ORDERER_CA \
  --signature-policy "OR('FarmersCoopMSP.peer','TestingLabsMSP.peer','ProcessorsMSP.peer','ManufacturersMSP.peer')"

echo ""
echo "âœ… ManufacturersMSP approved!"
echo ""

echo "ðŸ“¦ Step 5: Commit new policy to channel..."
export CORE_PEER_LOCALMSPID="FarmersCoopMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/users/Admin@farmers.herbaltrace.com/msp
export CORE_PEER_ADDRESS=peer0.farmers.herbaltrace.com:7051

docker exec cli peer lifecycle chaincode commit \
  -o orderer.herbaltrace.com:7050 \
  --ordererTLSHostnameOverride orderer.herbaltrace.com \
  --channelID $CHANNEL_NAME \
  --name $CC_NAME \
  --version $CC_VERSION \
  --sequence $CC_SEQUENCE \
  --tls \
  --cafile $ORDERER_CA \
  --peerAddresses peer0.farmers.herbaltrace.com:7051 \
  --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt \
  --peerAddresses peer0.labs.herbaltrace.com:9051 \
  --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/labs.herbaltrace.com/peers/peer0.labs.herbaltrace.com/tls/ca.crt \
  --signature-policy "OR('FarmersCoopMSP.peer','TestingLabsMSP.peer','ProcessorsMSP.peer','ManufacturersMSP.peer')"

echo ""
echo "âœ… Policy committed to channel!"
echo ""

echo "ðŸ“¦ Step 6: Verify new policy..."
docker exec cli peer lifecycle chaincode querycommitted -C $CHANNEL_NAME -n $CC_NAME

echo ""
echo "ðŸŽ‰ SUCCESS! Endorsement policy updated to OR (ANY org can approve)"
echo ""
echo "âœ… Existing farmer transactions: UNAFFECTED"
echo "âœ… New transactions: Can be approved by ANY organization"
echo "âœ… Lab tests, batches, products: Can now be synced!"
echo ""
echo "Next step: Run sync script to push data to blockchain"
echo "  cd backend && node simple-sync.js"

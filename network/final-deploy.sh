#!/bin/bash
export DOCKER_API_VERSION=1.43

PACKAGE_ID="herbaltrace_1.0:92f4668edb6720e317ac5d237a1cf1e904c5e49e55e9855817841ac04e879844"
CHANNEL_NAME="herbaltrace-channel"

echo "Approving for Farmers..."
docker exec -e CORE_PEER_LOCALMSPID=FarmersMSP -e CORE_PEER_ADDRESS=peer0.farmers.herbaltrace.com:7051 -e CORE_PEER_TLS_ENABLED=true -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/users/Admin@farmers.herbaltrace.com/msp cli peer lifecycle chaincode approveformyorg -o orderer.herbaltrace.com:7050 --ordererTLSHostnameOverride orderer.herbaltrace.com --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem --channelID $CHANNEL_NAME --name herbaltrace --version 1.0 --package-id $PACKAGE_ID --sequence 1

echo "Committing chaincode..."
docker exec -e CORE_PEER_LOCALMSPID=FarmersMSP -e CORE_PEER_ADDRESS=peer0.farmers.herbaltrace.com:7051 -e CORE_PEER_TLS_ENABLED=true -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/users/Admin@farmers.herbaltrace.com/msp cli peer lifecycle chaincode commit -o orderer.herbaltrace.com:7050 --ordererTLSHostnameOverride orderer.herbaltrace.com --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem --channelID $CHANNEL_NAME --name herbaltrace --version 1.0 --sequence 1 --peerAddresses peer0.farmers.herbaltrace.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt

echo "Done!"
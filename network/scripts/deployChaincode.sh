#!/bin/bash

set -euo pipefail

CHANNEL_NAME=${1:-herbaltrace-channel}
CC_NAME=${2:-herbaltrace}
CC_VERSION=${3:-1.0}
CC_PATH=${4:-/opt/gopath/src/github.com/chaincode/herbaltrace}
CC_LANG=${5:-golang}
CC_SEQUENCE=1

if [ "$CC_LANG" = "go" ]; then
  CC_LANG="golang"
fi

ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem
CC_LABEL=${CC_NAME}_${CC_VERSION}
PKG_FILE=${CC_NAME}.tar.gz

copy_chaincode_if_missing() {
  if ! docker exec cli sh -lc "test -f ${CC_PATH}/main.go" >/dev/null 2>&1; then
    docker exec cli sh -lc "mkdir -p /opt/gopath/src/github.com/chaincode"
    docker cp ../chaincode/herbaltrace cli:/opt/gopath/src/github.com/chaincode/herbaltrace
  fi
}

set_globals_invoke() {
  local MSP="$1"
  local ADDR="$2"
  local CRT="$3"
  local MSPPATH="$4"
  shift 4
  docker exec \
    -e CORE_PEER_LOCALMSPID="$MSP" \
    -e CORE_PEER_ADDRESS="$ADDR" \
    -e CORE_PEER_TLS_ENABLED=true \
    -e CORE_PEER_TLS_ROOTCERT_FILE="$CRT" \
    -e CORE_PEER_MSPCONFIGPATH="$MSPPATH" \
    cli "$@"
}

install_for_org() {
  local MSP="$1"
  local ADDR="$2"
  local CRT="$3"
  local MSPPATH="$4"

  set +e
  local output
  output=$(set_globals_invoke "$MSP" "$ADDR" "$CRT" "$MSPPATH" \
    peer lifecycle chaincode install "$PKG_FILE" 2>&1)
  local rc=$?
  set -e

  echo "$output"
  if [ $rc -ne 0 ] && ! echo "$output" | grep -qi "already successfully installed"; then
    echo "Error: failed to install chaincode for ${MSP}"
    exit $rc
  fi
}

approve_for_org() {
  local MSP="$1"
  local ADDR="$2"
  local CRT="$3"
  local MSPPATH="$4"
  local PACKAGE_ID="$5"

  set_globals_invoke "$MSP" "$ADDR" "$CRT" "$MSPPATH" \
    peer lifecycle chaincode approveformyorg \
      -o orderer.herbaltrace.com:7050 \
      --ordererTLSHostnameOverride orderer.herbaltrace.com \
      --tls --cafile "$ORDERER_CA" \
      --channelID "$CHANNEL_NAME" \
      --name "$CC_NAME" \
      --version "$CC_VERSION" \
      --package-id "$PACKAGE_ID" \
      --sequence "$CC_SEQUENCE"
}

approve_for_org_safe() {
  local MSP="$1"
  local ADDR="$2"
  local CRT="$3"
  local MSPPATH="$4"
  local PACKAGE_ID="$5"

  set +e
  local output
  output=$(approve_for_org "$MSP" "$ADDR" "$CRT" "$MSPPATH" "$PACKAGE_ID" 2>&1)
  local rc=$?
  set -e

  echo "$output"
  if [ $rc -ne 0 ] && ! echo "$output" | grep -qi "attempted to redefine uncommitted"; then
    echo "Error: failed to approve chaincode for ${MSP}"
    exit $rc
  fi
}

echo "Preparing chaincode source in cli container..."
copy_chaincode_if_missing

echo "Packaging chaincode ${CC_NAME}..."
docker exec cli peer lifecycle chaincode package "$PKG_FILE" --path "$CC_PATH" --lang "$CC_LANG" --label "$CC_LABEL"

echo "Installing chaincode on all org peers..."
install_for_org "FarmersCoopMSP" "peer0.farmers.herbaltrace.com:7051" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/users/Admin@farmers.herbaltrace.com/msp" \

install_for_org "TestingLabsMSP" "peer0.labs.herbaltrace.com:9051" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/labs.herbaltrace.com/peers/peer0.labs.herbaltrace.com/tls/ca.crt" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/labs.herbaltrace.com/users/Admin@labs.herbaltrace.com/msp" \

install_for_org "ProcessorsMSP" "peer0.processors.herbaltrace.com:11051" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/peers/peer0.processors.herbaltrace.com/tls/ca.crt" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/users/Admin@processors.herbaltrace.com/msp" \

install_for_org "ManufacturersMSP" "peer0.manufacturers.herbaltrace.com:13051" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/manufacturers.herbaltrace.com/peers/peer0.manufacturers.herbaltrace.com/tls/ca.crt" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/manufacturers.herbaltrace.com/users/Admin@manufacturers.herbaltrace.com/msp"

echo "Resolving package ID..."
PACKAGE_ID=$(set_globals_invoke "ProcessorsMSP" "peer0.processors.herbaltrace.com:11051" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/peers/peer0.processors.herbaltrace.com/tls/ca.crt" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/users/Admin@processors.herbaltrace.com/msp" \
  peer lifecycle chaincode queryinstalled | sed -n "s/^Package ID: \(.*\), Label: ${CC_LABEL}$/\1/p" | head -n 1)

if [ -z "$PACKAGE_ID" ]; then
  echo "Error: could not resolve PACKAGE_ID for label $CC_LABEL"
  exit 1
fi

echo "PACKAGE_ID=$PACKAGE_ID"

echo "Approving chaincode for all orgs..."
approve_for_org_safe "FarmersCoopMSP" "peer0.farmers.herbaltrace.com:7051" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/users/Admin@farmers.herbaltrace.com/msp" \
  "$PACKAGE_ID"

approve_for_org_safe "TestingLabsMSP" "peer0.labs.herbaltrace.com:9051" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/labs.herbaltrace.com/peers/peer0.labs.herbaltrace.com/tls/ca.crt" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/labs.herbaltrace.com/users/Admin@labs.herbaltrace.com/msp" \
  "$PACKAGE_ID"

approve_for_org_safe "ProcessorsMSP" "peer0.processors.herbaltrace.com:11051" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/peers/peer0.processors.herbaltrace.com/tls/ca.crt" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/users/Admin@processors.herbaltrace.com/msp" \
  "$PACKAGE_ID"

approve_for_org_safe "ManufacturersMSP" "peer0.manufacturers.herbaltrace.com:13051" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/manufacturers.herbaltrace.com/peers/peer0.manufacturers.herbaltrace.com/tls/ca.crt" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/manufacturers.herbaltrace.com/users/Admin@manufacturers.herbaltrace.com/msp" \
  "$PACKAGE_ID"

echo "Checking if chaincode is already committed..."
set +e
COMMITTED_OUTPUT=$(set_globals_invoke "ProcessorsMSP" "peer0.processors.herbaltrace.com:11051" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/peers/peer0.processors.herbaltrace.com/tls/ca.crt" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/users/Admin@processors.herbaltrace.com/msp" \
  peer lifecycle chaincode querycommitted --channelID "$CHANNEL_NAME" --name "$CC_NAME" 2>&1)
set -e

if echo "$COMMITTED_OUTPUT" | grep -q "Version: ${CC_VERSION}" && echo "$COMMITTED_OUTPUT" | grep -q "Sequence: ${CC_SEQUENCE}"; then
  echo "$COMMITTED_OUTPUT"
  echo "Chaincode definition already committed."
  echo "Chaincode deployment completed successfully"
  exit 0
fi

echo "Committing chaincode definition..."
set_globals_invoke "ProcessorsMSP" "peer0.processors.herbaltrace.com:11051" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/peers/peer0.processors.herbaltrace.com/tls/ca.crt" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/users/Admin@processors.herbaltrace.com/msp" \
  peer lifecycle chaincode commit \
    -o orderer.herbaltrace.com:7050 \
    --ordererTLSHostnameOverride orderer.herbaltrace.com \
    --tls --cafile "$ORDERER_CA" \
    --channelID "$CHANNEL_NAME" \
    --name "$CC_NAME" \
    --version "$CC_VERSION" \
    --sequence "$CC_SEQUENCE" \
    --peerAddresses peer0.farmers.herbaltrace.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt \
    --peerAddresses peer0.labs.herbaltrace.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/labs.herbaltrace.com/peers/peer0.labs.herbaltrace.com/tls/ca.crt \
    --peerAddresses peer0.processors.herbaltrace.com:11051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/peers/peer0.processors.herbaltrace.com/tls/ca.crt \
    --peerAddresses peer0.manufacturers.herbaltrace.com:13051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/manufacturers.herbaltrace.com/peers/peer0.manufacturers.herbaltrace.com/tls/ca.crt

echo "Verifying committed chaincode..."
set_globals_invoke "ProcessorsMSP" "peer0.processors.herbaltrace.com:11051" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/peers/peer0.processors.herbaltrace.com/tls/ca.crt" \
  "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/processors.herbaltrace.com/users/Admin@processors.herbaltrace.com/msp" \
  peer lifecycle chaincode querycommitted --channelID "$CHANNEL_NAME" --name "$CC_NAME"

echo "Chaincode deployment completed successfully"

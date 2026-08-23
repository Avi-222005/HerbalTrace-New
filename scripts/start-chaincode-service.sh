#!/bin/bash
# Start chaincode as a service (CCAAS mode workaround)
# This runs the chaincode in a separate container listening on a known port

set -e

CHAINCODE_NAME="herbaltrace"
CHAINCODE_VERSION="1.0"
CHAINCODE_CCID="${CHAINCODE_NAME}_${CHAINCODE_VERSION}"
CHAINCODE_PORT=9999

echo "ðŸ”„ Starting Chaincode as a Service (CCAAS): $CHAINCODE_CCID on port $CHAINCODE_PORT"

# Create a Docker network for chaincode if it doesn't exist
docker network create chaincode-network 2>/dev/null || true

# Run the chaincode in a container connected to the peer network
docker run -d \
  --name ${CHAINCODE_NAME}-service \
  --network herbaltrace-network \
  --rm \
  -e CORE_CHAINCODE_ID_NAME=${CHAINCODE_CCID} \
  -e CORE_PEER_ADDRESS=peer0.processors.herbaltrace.com:11051 \
  -e CC_SERVER_PORT=${CHAINCODE_PORT} \
  -p ${CHAINCODE_PORT}:${CHAINCODE_PORT} \
  hyperledger/fabric-ccenv:2.5 \
  sh -c "cd /opt/gopath && go build -o ${CHAINCODE_NAME} && ./${CHAINCODE_NAME}"

echo "âœ… Chaincode service started"
echo "   Name: $CHAINCODE_CCID"
echo "   Port: $CHAINCODE_PORT"

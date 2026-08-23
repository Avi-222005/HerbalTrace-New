#!/usr/bin/env python3
"""
Chaincode deployment using Docker SDK for Python
This bypasses the Docker CLI API version issues
"""

import docker
import sys

def deploy_chaincode():
    try:
        print("\n" + "="*50)
        print("  HerbalTrace Chaincode Deployment (Python)")
        print("="*50 + "\n")
        
        # Connect to Docker
        print("[1/4] Connecting to Docker...")
        client = docker.from_env()
        print("✅ Connected to Docker\n")
        
        # Get CLI container
        print("[2/4] Finding CLI container...")
        cli_container = client.containers.get('cli')
        print("✅ CLI container found\n")
        
        PACKAGE_ID = "herbaltrace_1.0:92f4668edb6720e317ac5d237a1cf1e904c5e49e55e9855817841ac04e879844"
        CHANNEL_NAME = "herbaltrace-channel"
        
        # Approve chaincode
        print("[3/4] Approving chaincode for Farmers...")
        approve_cmd = (
            "peer lifecycle chaincode approveformyorg "
            "-o orderer.herbaltrace.com:7050 "
            "--ordererTLSHostnameOverride orderer.herbaltrace.com "
            "--tls "
            "--cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem "
            f"--channelID {CHANNEL_NAME} "
            "--name herbaltrace "
            "--version 1.0 "
            f"--package-id {PACKAGE_ID} "
            "--sequence 1"
        )
        
        env = {
            "CORE_PEER_LOCALMSPID": "FarmersMSP",
            "CORE_PEER_ADDRESS": "peer0.farmers.herbaltrace.com:7051",
            "CORE_PEER_TLS_ENABLED": "true",
            "CORE_PEER_TLS_ROOTCERT_FILE": "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt",
            "CORE_PEER_MSPCONFIGPATH": "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/users/Admin@farmers.herbaltrace.com/msp"
        }
        
        result = cli_container.exec_run(approve_cmd, environment=env)
        print(result.output.decode('utf-8'))
        
        if result.exit_code != 0:
            print("❌ Approval failed!")
            return False
        
        print("✅ Chaincode approved!\n")
        
        # Commit chaincode
        print("[4/4] Committing chaincode to channel...")
        commit_cmd = (
            "peer lifecycle chaincode commit "
            "-o orderer.herbaltrace.com:7050 "
            "--ordererTLSHostnameOverride orderer.herbaltrace.com "
            "--tls "
            "--cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem "
            f"--channelID {CHANNEL_NAME} "
            "--name herbaltrace "
            "--version 1.0 "
            "--sequence 1 "
            "--peerAddresses peer0.farmers.herbaltrace.com:7051 "
            "--tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt"
        )
        
        result = cli_container.exec_run(commit_cmd, environment=env)
        print(result.output.decode('utf-8'))
        
        if result.exit_code != 0:
            print("❌ Commit failed!")
            return False
        
        print("\n" + "="*50)
        print("  ✅ DEPLOYMENT COMPLETE!")
        print("="*50 + "\n")
        print("Your HerbalTrace blockchain is ready!\n")
        print("Next steps:")
        print("  1. Run QUICK-START.bat")
        print("  2. Access http://localhost:5173\n")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = deploy_chaincode()
    sys.exit(0 if success else 1)

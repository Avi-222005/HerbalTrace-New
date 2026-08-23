/**
 * Test script to create a simple Alert on the blockchain
 * This is the simplest chaincode entity (alerts.go)
 */

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function main() {
  try {
    console.log('\n🧪 Testing Alert Creation (Simplest Chaincode)...\n');

    // Load wallet
    const walletPath = path.join(__dirname, '..', 'network', 'wallet');
    console.log(`📁 Wallet path: ${walletPath}`);
    
    if (!fs.existsSync(walletPath)) {
      throw new Error(`Wallet not found at ${walletPath}`);
    }

    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check for admin identity - use Processors admin as per FabricClient
    const identities = await wallet.list();
    console.log(`\n👤 Available identities: ${identities.map(i => i.label).join(', ')}\n`);
    
    const adminLabel = 'admin-Processors';
    const identity = await wallet.get(adminLabel);
    
    if (!identity) {
      throw new Error(`Identity ${adminLabel} not found in wallet`);
    }
    console.log(`✅ Using identity: ${adminLabel}`);

    // Build connection profile for Processors org (as per FabricClient)
    const orgAlias = 'processors';
    const peerHost = `peer0.${orgAlias}.herbaltrace.com`;
    const orgBase = path.resolve(__dirname, `../network/organizations/peerOrganizations/${orgAlias}.herbaltrace.com`);
    const peerTlsPath = path.join(orgBase, `peers/${peerHost}/tls/ca.crt`);
    const ordererTlsPath = path.resolve(__dirname, '../network/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem');

    console.log(`\n🔐 Checking certificates...`);
    console.log(`  Peer TLS: ${peerTlsPath}`);
    console.log(`  Orderer TLS: ${ordererTlsPath}`);

    if (!fs.existsSync(peerTlsPath)) {
      throw new Error(`Peer TLS cert not found: ${peerTlsPath}`);
    }
    if (!fs.existsSync(ordererTlsPath)) {
      throw new Error(`Orderer TLS cert not found: ${ordererTlsPath}`);
    }

    const peerTlsPem = fs.readFileSync(peerTlsPath, 'utf8');
    const ordererTlsPem = fs.readFileSync(ordererTlsPath, 'utf8');

    const ccp = {
      name: 'herbaltrace-processors',
      version: '1.0.0',
      client: {
        organization: orgAlias,
        connection: {
          timeout: {
            peer: { endorser: '300' },
            orderer: '300'
          }
        }
      },
      organizations: {
        [orgAlias]: {
          mspid: 'ProcessorsMSP',
          peers: [peerHost],
          certificateAuthorities: [`ca.${orgAlias}.herbaltrace.com`]
        }
      },
      peers: {
        [peerHost]: {
          url: 'grpcs://localhost:11051',
          tlsCACerts: { pem: peerTlsPem },
          grpcOptions: {
            'ssl-target-name-override': peerHost,
            hostnameOverride: peerHost
          }
        }
      },
      orderers: {
        'orderer.herbaltrace.com': {
          url: 'grpcs://localhost:7050',
          tlsCACerts: { pem: ordererTlsPem },
          grpcOptions: {
            'ssl-target-name-override': 'orderer.herbaltrace.com',
            hostnameOverride: 'orderer.herbaltrace.com'
          }
        }
      },
      certificateAuthorities: {
        [`ca.${orgAlias}.herbaltrace.com`]: {
          url: 'https://localhost:7054',
          caName: `ca.${orgAlias}.herbaltrace.com`,
          tlsCACerts: { pem: peerTlsPem }
        }
      }
    };

    console.log(`\n🌐 Connecting to Fabric Gateway...`);
    
    // Create gateway
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: adminLabel,
      discovery: { enabled: false, asLocalhost: true }
    });

    console.log(`✅ Gateway connected`);

    // Get channel and contract
    const channelName = 'herbaltrace-channel';
    const chaincodeName = 'herbaltrace';
    
    console.log(`\n📡 Getting channel: ${channelName}`);
    const network = await gateway.getNetwork(channelName);
    
    console.log(`📜 Getting chaincode: ${chaincodeName}`);
    const contract = network.getContract(chaincodeName);

    console.log(`\n🔨 Creating Alert on blockchain...`);
    
    // Create a simple alert
    const alertId = `ALERT-${Date.now()}`;
    const alertData = {
      id: alertId,
      alertType: 'system',
      severity: 'low',
      message: 'Test alert created to verify blockchain connectivity',
      entityId: 'TEST-001',
      entityType: 'system_test',
      details: 'This is a test alert to verify blockchain is working',
      createdBy: 'test-script'
    };

    console.log(`\nAlert Data:`);
    console.log(`  ID: ${alertId}`);
    console.log(`  Alert Type: ${alertData.alertType}`);
    console.log(`  Severity: ${alertData.severity}`);
    console.log(`  Message: ${alertData.message}`);

    // Submit transaction (CreateAlert expects JSON string)
    const result = await contract.submitTransaction(
      'CreateAlert',
      JSON.stringify(alertData)
    );

    console.log(`\n✅ SUCCESS! Alert created on blockchain`);
    console.log(`\n📄 Transaction Result:`);
    console.log(result.toString());

    // Try to retrieve the alert
    console.log(`\n🔍 Retrieving alert from blockchain...`);
    const retrievedAlert = await contract.evaluateTransaction('GetAlert', alertId);
    console.log(`\n✅ Alert retrieved successfully:`);
    console.log(JSON.parse(retrievedAlert.toString()));

    // Disconnect
    gateway.disconnect();
    console.log(`\n✅ Test completed successfully! Blockchain is working.`);
    
  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

main();

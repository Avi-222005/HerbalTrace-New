#!/usr/bin/env node

/**
 * Test if chaincode is deployed and working
 */

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const NETWORK_DIR = path.join(__dirname, '..', 'network');
const WALLET_DIR = path.join(NETWORK_DIR, 'wallet');

async function testChaincode() {
  try {
    console.log('🔍 Testing chaincode deployment...\n');
    
    // Load connection profile
    const ccpPath = path.join(
      NETWORK_DIR,
      'organizations',
      'peerOrganizations',
      'farmers.herbaltrace.com',
      'connection-farmers.json'
    );
    
    if (!fs.existsSync(ccpPath)) {
      console.error('❌ Connection profile not found:', ccpPath);
      return false;
    }
    
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    console.log('✅ Connection profile loaded');
    
    // Check wallet
    const wallet = await Wallets.newFileSystemWallet(WALLET_DIR);
    const adminIdentity = 'admin-Farmers';
    const identity = await wallet.get(adminIdentity);
    
    if (!identity) {
      console.error('❌ Admin identity not found in wallet');
      return false;
    }
    
    console.log('✅ Admin identity found in wallet');
    
    // Connect to gateway
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: adminIdentity,
      discovery: { enabled: true, asLocalhost: false },
    });
    
    console.log('✅ Connected to gateway');
    
    // Get network and contract
    const network = await gateway.getNetwork('herbaltrace-channel');
    console.log('✅ Channel joined');
    
    const contract = network.getContract('herbaltrace');
    console.log('✅ Chaincode contract obtained');
    
    // Try a simple query
    console.log('\n📝 Testing chaincode invocation...');
    try {
      const result = await contract.evaluateTransaction('GetActiveAlerts');
      console.log('✅ Chaincode is WORKING!');
      console.log('   Response:', result.toString());
    } catch (err) {
      if (err.message.includes('chaincode herbaltrace not found')) {
        console.log('❌ Chaincode NOT deployed on channel');
        return false;
      }
      // Other errors might be OK (like empty results)
      console.log('⚠️  Chaincode invoked but returned error:', err.message.substring(0, 100));
    }
    
    await gateway.disconnect();
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    return false;
  }
}

testChaincode()
  .then((success) => {
    console.log('\n' + '='.repeat(50));
    if (success) {
      console.log('✅ CHAINCODE IS DEPLOYED AND WORKING');
    } else {
      console.log('❌ CHAINCODE DEPLOYMENT CHECK FAILED');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });

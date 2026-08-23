#!/usr/bin/env node

/**
 * Install chaincode using Fabric Node.js SDK instead of peer CLI
 * This bypasses the Docker socket issue
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const tar = require('tar');
const { Wallets, Gateway } = require('fabric-network');

const NETWORK_DIR = path.join(__dirname, '..', 'network');
const WALLET_DIR = path.join(NETWORK_DIR, 'wallet');
const ORG_CONFIGS = {
  Processors: {
    mspId: 'ProcessorsMSP',
    domain: 'processors.herbaltrace.com',
    peer: 'peer0.processors.herbaltrace.com',
    peerPort: 11051,
    ccpPath: path.join(NETWORK_DIR, 'organizations', 'peerOrganizations', 'processors.herbaltrace.com', 'connection-processors.json'),
  },
  Manufacturers: {
    mspId: 'ManufacturersMSP',
    domain: 'manufacturers.herbaltrace.com',
    peer: 'peer0.manufacturers.herbaltrace.com',
    peerPort: 13051,
    ccpPath: path.join(NETWORK_DIR, 'organizations', 'peerOrganizations', 'manufacturers.herbaltrace.com', 'connection-manufacturers.json'),
  },
};

async function installChaincode() {
  for (const [orgName, orgConfig] of Object.entries(ORG_CONFIGS)) {
    try {
      console.log(`\n========== Installing chaincode on ${orgName} ==========`);
      
      const wallet = await Wallets.newFileSystemWallet(WALLET_DIR);
      const adminIdentity = `admin-${orgName.charAt(0).toUpperCase() + orgName.slice(1)}`;
      const identity = await wallet.get(adminIdentity);
      
      if (!identity) {
        console.error(`❌ Identity not found: ${adminIdentity}`);
        continue;
      }
      
      const ccp = JSON.parse(fs.readFileSync(orgConfig.ccpPath, 'utf-8'));
      const gateway = new Gateway();
      
      console.log(`[1/4] Connecting to gateway for ${orgName}...`);
      await gateway.connect(ccp, {
        wallet,
        identity: adminIdentity,
        discovery: { enabled: false },
      });
      
      console.log(`[2/4] Getting network...`);
      const network = await gateway.getNetwork('herbaltrace-channel');
      const contract = network.getContract('_lifecycle');
      
      // Package the chaincode
      const chaincodePackagePath = path.join(__dirname, 'herbaltrace.tar.gz');
      if (!fs.existsSync(chaincodePackagePath)) {
        console.error(`❌ Chaincode package not found: ${chaincodePackagePath}`);
        await gateway.disconnect();
        continue;
      }
      
      const chaincodePackageBuffer = fs.readFileSync(chaincodePackagePath);
      const base64Package = chaincodePackageBuffer.toString('base64');
      
      // Get the package ID (label.version format)
      const packageId = 'herbaltrace_1.0';
      
      console.log(`[3/4] Installing chaincode package (${packageId})...`);
      try {
        const installResult = await contract.submitTransaction(
          'InstallChaincode',
          base64Package
        );
        console.log(`✅ Chaincode installed on ${orgName}`);
        console.log(`   Package ID: ${installResult.toString()}`);
      } catch (installError) {
        if (installError.message.includes('chaincode code already exists')) {
          console.log(`ℹ️  Chaincode already installed on ${orgName}`);
        } else {
          throw installError;
        }
      }
      
      // Check installed chaincodes
      console.log(`[4/4] Verifying installation...`);
      const queryResult = await contract.evaluateTransaction('QueryInstalledChaincode', packageId);
      console.log(`✅ Verification successful for ${orgName}`);
      console.log(`   Installed package: ${queryResult.toString()}`);
      
      await gateway.disconnect();
      
    } catch (error) {
      console.error(`❌ Error for ${orgName}:`, error.message);
      if (error.details) {
        console.error(`Details:`, error.details);
      }
    }
  }
}

async function main() {
  try {
    console.log('🔥 Hyperledger Fabric Chaincode Installer (SDK Method)');
    console.log('=' .repeat(50));
    
    // Check prerequisites
    if (!fs.existsSync(WALLET_DIR)) {
      console.error('❌ Wallet directory not found:', WALLET_DIR);
      process.exit(1);
    }
    
    await installChaincode();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Chaincode installation complete');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

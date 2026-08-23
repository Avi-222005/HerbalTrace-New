#!/usr/bin/env node
/**
 * Rebuild wallet with CORRECT certificates from organizations directory
 * Uses the canonical admin certificates that are recognized by the channel MSP
 */

const fs = require('fs');
const path = require('path');

const WALLET_DIR = path.join(__dirname, '..', 'network', 'wallet');
const ORGS_DIR = path.join(__dirname, '..', 'network', 'organizations', 'peerOrganizations');

const organizations = [
  { org: 'farmers.herbaltrace.com', mspId: 'FarmersCoopMSP', label: 'admin-Farmers' },
  { org: 'labs.herbaltrace.com', mspId: 'TestingLabsMSP', label: 'admin-Labs' },
  { org: 'processors.herbaltrace.com', mspId: 'ProcessorsMSP', label: 'admin-Processors' },
  { org: 'manufacturers.herbaltrace.com', mspId: 'ManufacturersMSP', label: 'admin-Manufacturers' }
];

console.log('=== REBUILDING WALLET WITH CORRECT CERTIFICATES ===\n');

// Ensure wallet directory exists
if (!fs.existsSync(WALLET_DIR)) {
  fs.mkdirSync(WALLET_DIR, { recursive: true });
  console.log('✓ Created wallet directory');
}

let successCount = 0;

for (const orgConfig of organizations) {
  try {
    // Build paths
    const orgPath = path.join(ORGS_DIR, orgConfig.org);
    const adminPath = path.join(orgPath, 'users', `Admin@${orgConfig.org}`);
    
    const certPath = path.join(adminPath, 'msp', 'signcerts', `Admin@${orgConfig.org}-cert.pem`);
    const keyPath = path.join(adminPath, 'msp', 'keystore');
    const cacertPath = path.join(adminPath, 'msp', 'cacerts');
    
    // Verify paths exist
    if (!fs.existsSync(certPath)) {
      console.error(`✗ Certificate not found: ${certPath}`);
      continue;
    }
    if (!fs.existsSync(keyPath)) {
      console.error(`✗ Keystore not found: ${keyPath}`);
      continue;
    }
    if (!fs.existsSync(cacertPath)) {
      console.error(`✗ CA certs not found: ${cacertPath}`);
      continue;
    }
    
    // Read certificate
    const certificate = fs.readFileSync(certPath, 'utf8');
    
    // Read private key (should be single file in keystore)
    const keyFiles = fs.readdirSync(keyPath).filter(f => f.endsWith('_sk'));
    if (keyFiles.length === 0) {
      console.error(`✗ No private key found in ${keyPath}`);
      continue;
    }
    const privateKey = fs.readFileSync(path.join(keyPath, keyFiles[0]), 'utf8');
    
    // Read CA certs
    const caCertFiles = fs.readdirSync(cacertPath).filter(f => f.endsWith('.pem'));
    const caCert = caCertFiles.length > 0 
      ? fs.readFileSync(path.join(cacertPath, caCertFiles[0]), 'utf8')
      : certificate; // Fallback to self if no separate CA cert
    
    // Create wallet identity in Fabric SDK v1 format
    const identity = {
      credentials: {
        certificate: certificate,
        privateKey: privateKey
      },
      mspId: orgConfig.mspId,
      type: 'X.509',
      version: 1
    };
    
    // Write to wallet
    const walletFile = path.join(WALLET_DIR, `${orgConfig.label}.id`);
    fs.writeFileSync(walletFile, JSON.stringify(identity, null, 2));
    
    console.log(`✓ ${orgConfig.label} (${orgConfig.mspId}) - CERTIFICATE FROM ORGANIZATIONS`);
    console.log(`  Cert path: ${certPath}`);
    console.log(`  Wallet file: ${walletFile}`);
    successCount++;
    
  } catch (error) {
    console.error(`✗ Error processing ${orgConfig.label}:`, error.message);
  }
}

console.log(`\n=== RESULT ===`);
console.log(`Successfully rebuilt ${successCount}/${organizations.length} wallet identities`);
console.log('\nWallet directory:', WALLET_DIR);
console.log('');

if (successCount === organizations.length) {
  console.log('✅ Wallet rebuild complete! All identities use certificates from organizations directory.');
  process.exit(0);
} else {
  console.log('⚠️  Partial wallet rebuild. Some identities may be missing.');
  process.exit(1);
}

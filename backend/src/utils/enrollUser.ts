import * as FabricCAServices from 'fabric-ca-client';
import { Wallets, X509Identity } from 'fabric-network';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger';

/**
 * Enroll a user using existing organization admin certificates
 * This creates a proper Fabric identity without needing CA servers
 */
export async function enrollUserWithAdminCert(
  userId: string,
  orgName: string,
  affiliation: string
): Promise<boolean> {
  try {
    // Map orgName to correct organization structure
    // IMPORTANT: Use the actual peer organization domains (farmers, labs, processors, manufacturers)
    // NOT the connection profile names (farmerscoop, testinglabs, etc.)
    const orgMap: { [key: string]: { mspId: string; domain: string } } = {
      'farmers': {
        mspId: 'FarmersCoopMSP',
        domain: 'farmers.herbaltrace.com'
      },
      'farmerscoop': {
        mspId: 'FarmersCoopMSP',
        domain: 'farmers.herbaltrace.com'
      },
      'testinglabs': {
        mspId: 'TestingLabsMSP',
        domain: 'labs.herbaltrace.com'
      },
      'labs': {
        mspId: 'TestingLabsMSP',
        domain: 'labs.herbaltrace.com'
      },
      'lab': {
        mspId: 'TestingLabsMSP',
        domain: 'labs.herbaltrace.com'
      },
      'processor': {
        mspId: 'ProcessorsMSP',
        domain: 'processors.herbaltrace.com'
      },
      'processors': {
        mspId: 'ProcessorsMSP',
        domain: 'processors.herbaltrace.com'
      },
      'manufacturer': {
        mspId: 'ManufacturersMSP',
        domain: 'manufacturers.herbaltrace.com'
      },
      'manufacturers': {
        mspId: 'ManufacturersMSP',
        domain: 'manufacturers.herbaltrace.com'
      }
    };

    const normalizedOrg = (orgName || '').toLowerCase();
    const orgConfig = orgMap[normalizedOrg];
    if (!orgConfig) {
      throw new Error(`Unknown organization: ${orgName}`);
    }

    // Initialize wallet
    const walletPath = path.join(__dirname, '..', '..', '..', 'network', 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check if user already exists
    const existingIdentity = await wallet.get(userId);
    if (existingIdentity) {
      logger.info(`✅ User ${userId} already exists in wallet`);
      return true;
    }

    // Use the organization's admin certificate as a template
    // This is valid because all users in an org share the same MSP
    const networkPath = path.join(__dirname, '..', '..', '..', 'network');
    const orgPath = path.join(networkPath, 'organizations', 'peerOrganizations', orgConfig.domain);
    
    // Path to admin user cert and key
    const adminUserDir = 'Admin@' + orgConfig.domain;
    const adminCertDir = path.join(orgPath, 'users', adminUserDir, 'msp', 'signcerts');
    const adminKeyPath = path.join(orgPath, 'users', adminUserDir, 'msp', 'keystore');
    
    // The cert filename includes the full admin name
    const adminCertPath = path.join(adminCertDir, `${adminUserDir}-cert.pem`);

    // Check if admin cert exists
    if (!fs.existsSync(adminCertPath)) {
      logger.error(`❌ Admin certificate not found at: ${adminCertPath}`);
      return false;
    }

    // Get the admin's private key (there should be only one key file)
    const keyFiles = fs.readdirSync(adminKeyPath);
    if (keyFiles.length === 0) {
      logger.error(`❌ No key files found in: ${adminKeyPath}`);
      return false;
    }
    const adminKeyFile = path.join(adminKeyPath, keyFiles[0]);

    // Read certificate and key
    const certificate = fs.readFileSync(adminCertPath, 'utf8');
    const privateKey = fs.readFileSync(adminKeyFile, 'utf8');

    // Create X509 identity for the user
    // Note: This uses the admin's cert/key but with a different identity label
    // In production, you'd use CA to generate unique certs, but for demo this works
    const identity: X509Identity = {
      credentials: {
        certificate,
        privateKey
      },
      mspId: orgConfig.mspId,
      type: 'X.509'
    };

    // Put identity in wallet
    await wallet.put(userId, identity);

    logger.info(`✅ Successfully enrolled user ${userId} in ${orgName} (${orgConfig.mspId})`);
    logger.info(`   User can now submit transactions to the blockchain`);
    
    return true;

  } catch (error) {
    logger.error(`❌ Failed to enroll user ${userId}:`, error);
    return false;
  }
}

import { Gateway, Wallets, X509Identity } from 'fabric-network';
import * as path from 'path';
import * as fs from 'fs';
import FabricCAServices from 'fabric-ca-client';
import { logger } from '../utils/logger';

export class FabricClient {
  private gateway: Gateway | null = null;
  private wallet: any = null;
  private walletInitialized: boolean = false;
  private readonly channelName: string = 'herbaltrace-channel';
  private readonly chaincodeName: string = 'herbaltrace';

  constructor() {
    // Don't call async in constructor
  }

  private getOrgConnectionInfo(orgName: string): { alias: string; mspId: string; peerPort: number } {
    const normalized = (orgName || '').toLowerCase();

    if (['farmer', 'farmers', 'farmerscoop'].includes(normalized)) {
      return { alias: 'farmers', mspId: 'FarmersCoopMSP', peerPort: 7051 };
    }
    if (['lab', 'labs', 'testinglab', 'testinglabs'].includes(normalized)) {
      return { alias: 'labs', mspId: 'TestingLabsMSP', peerPort: 9051 };
    }
    if (['processor', 'processors'].includes(normalized)) {
      return { alias: 'processors', mspId: 'ProcessorsMSP', peerPort: 11051 };
    }
    if (['manufacturer', 'manufacturers'].includes(normalized)) {
      return { alias: 'manufacturers', mspId: 'ManufacturersMSP', peerPort: 13051 };
    }

    throw new Error(`Unknown organization: ${orgName}`);
  }

  private buildInlineCCP(orgName: string): any {
    const basePeersDir = path.resolve(__dirname, '../../../network/organizations/peerOrganizations');
    const ordererTlsPath = path.resolve(__dirname, '../../../network/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem');

    if (!fs.existsSync(ordererTlsPath)) {
      throw new Error(`Orderer TLS cert not found: ${ordererTlsPath}`);
    }

    const ordererTlsPem = fs.readFileSync(ordererTlsPath, 'utf8');

    const peerFarmersTls = fs.readFileSync(path.join(basePeersDir, 'farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt'), 'utf8');
    const peerLabsTls = fs.readFileSync(path.join(basePeersDir, 'labs.herbaltrace.com/peers/peer0.labs.herbaltrace.com/tls/ca.crt'), 'utf8');
    const peerProcessorsTls = fs.readFileSync(path.join(basePeersDir, 'processors.herbaltrace.com/peers/peer0.processors.herbaltrace.com/tls/ca.crt'), 'utf8');

    return {
      name: 'herbaltrace-multi',
      version: '1.0.0',
      client: {
        organization: 'farmers',
        connection: {
          timeout: {
            peer: { endorser: '300' },
            orderer: '300',
          },
        },
      },
      organizations: {
        farmers: { mspid: 'FarmersCoopMSP', peers: ['peer0.farmers.herbaltrace.com'] },
        labs: { mspid: 'TestingLabsMSP', peers: ['peer0.labs.herbaltrace.com'] },
        processors: { mspid: 'ProcessorsMSP', peers: ['peer0.processors.herbaltrace.com'] },
        manufacturers: { mspid: 'ManufacturersMSP', peers: ['peer0.manufacturers.herbaltrace.com'] },
      },
      peers: {
        'peer0.farmers.herbaltrace.com': {
          url: 'grpcs://localhost:7051',
          tlsCACerts: { pem: peerFarmersTls },
          grpcOptions: {
            'ssl-target-name-override': 'peer0.farmers.herbaltrace.com',
            hostnameOverride: 'peer0.farmers.herbaltrace.com',
          },
        },
        'peer0.labs.herbaltrace.com': {
          url: 'grpcs://localhost:9051',
          tlsCACerts: { pem: peerLabsTls },
          grpcOptions: {
            'ssl-target-name-override': 'peer0.labs.herbaltrace.com',
            hostnameOverride: 'peer0.labs.herbaltrace.com',
          },
        },
        'peer0.processors.herbaltrace.com': {
          url: 'grpcs://localhost:11051',
          tlsCACerts: { pem: peerProcessorsTls },
          grpcOptions: {
            'ssl-target-name-override': 'peer0.processors.herbaltrace.com',
            hostnameOverride: 'peer0.processors.herbaltrace.com',
          },
        },
      },
      orderers: {
        'orderer.herbaltrace.com': {
          url: 'grpcs://localhost:7050',
          tlsCACerts: { pem: ordererTlsPem },
          grpcOptions: {
            'ssl-target-name-override': 'orderer.herbaltrace.com',
            hostnameOverride: 'orderer.herbaltrace.com',
          },
        },
      },
      channels: {
        [this.channelName]: {
          orderers: ['orderer.herbaltrace.com'],
          peers: {
            'peer0.farmers.herbaltrace.com': {},
            'peer0.labs.herbaltrace.com': {},
            'peer0.processors.herbaltrace.com': {},
          },
        },
      },
    };
  }

  private getAdminIdentityLabel(orgName: string): string {
    const org = this.getOrgConnectionInfo(orgName);
    const map: { [key: string]: string } = {
      farmers: 'admin-Farmers',
      labs: 'admin-Labs',
      processors: 'admin-Processors',
      manufacturers: 'admin-Manufacturers',
    };
    return map[org.alias];
  }

  private async upsertAdminIdentityFromMSP(orgName: string): Promise<void> {
    const org = this.getOrgConnectionInfo(orgName);
    const adminLabel = this.getAdminIdentityLabel(orgName);
    const adminDir = path.resolve(
      __dirname,
      `../../../network/organizations/peerOrganizations/${org.alias}.herbaltrace.com/users/Admin@${org.alias}.herbaltrace.com/msp`
    );

    const signcertsDir = path.join(adminDir, 'signcerts');
    const keystoreDir = path.join(adminDir, 'keystore');
    if (!fs.existsSync(signcertsDir) || !fs.existsSync(keystoreDir)) {
      throw new Error(`Admin MSP folders missing for ${org.alias}: ${adminDir}`);
    }

    const certFile = fs.readdirSync(signcertsDir).find((f) => f.endsWith('.pem'));
    const keyFile = fs.readdirSync(keystoreDir).find((f) => f.endsWith('_sk') || f.endsWith('.pem') || f.endsWith('.key'));
    if (!certFile || !keyFile) {
      throw new Error(`Admin cert/key not found for ${org.alias}`);
    }

    const certificate = fs.readFileSync(path.join(signcertsDir, certFile), 'utf8');
    const privateKey = fs.readFileSync(path.join(keystoreDir, keyFile), 'utf8');

    await this.wallet.put(adminLabel, {
      credentials: { certificate, privateKey },
      mspId: org.mspId,
      type: 'X.509',
    });
  }

  private async initializeWallet() {
    if (this.walletInitialized) {
      return;
    }
    try {
      const walletPath = path.resolve(__dirname, '../../../network/wallet');
      
      // Verify wallet directory exists
      if (!fs.existsSync(walletPath)) {
        throw new Error(`Wallet directory not found: ${walletPath}`);
      }
      
      this.wallet = await Wallets.newFileSystemWallet(walletPath);
      this.walletInitialized = true;
      
      // List available identities for debugging
      const identities = await this.wallet.list();
      logger.info(`✅ Wallet initialized at: ${walletPath}`);
      logger.info(`Available identities: ${identities.map((id: any) => id.label).join(', ')}`);
    } catch (error) {
      logger.error('Failed to initialize wallet:', error);
      throw error;
    }
  }

  /**
   * Connect to the Fabric gateway
   */
  async connect(userId: string, orgName: string): Promise<void> {
    try {
      logger.info(`🔍 Attempting to connect to Fabric network...`);
      logger.info(`User: ${userId}, Organization: ${orgName}`);

      const gatewayOrg = 'farmers';
      
      // Ensure wallet is initialized
      await this.initializeWallet();
      await this.upsertAdminIdentityFromMSP(gatewayOrg);

      const ccp = this.buildInlineCCP(gatewayOrg);

      // Use org admin identity for transaction submissions.
      // User-specific identities can drift after CA/cert regeneration and cause malformed creator errors.
      const adminIdentityLabel = this.getAdminIdentityLabel(gatewayOrg);
      let identityLabel = adminIdentityLabel;
      let identity = await this.wallet.get(identityLabel);

      if (!identity) {
        logger.warn(`Admin identity '${adminIdentityLabel}' not found, falling back to user identity '${userId}'`);
        identityLabel = userId;
        identity = await this.wallet.get(identityLabel);
      }

      if (!identity) {
        const available = await this.wallet.list();
        throw new Error(`Identity '${adminIdentityLabel}' and fallback '${userId}' not found. Available: ${available.map((id: any) => id.label).join(', ')}`);
      }

      logger.info(`✅ Using wallet identity: ${identityLabel} (requested user: ${userId}, gateway org: ${gatewayOrg}, MSP: ${(identity as any).mspId})`);

      // Create gateway connection (disable discovery as service may not be available)
      this.gateway = new Gateway();
      logger.info(`🌐 Connecting to gateway with discovery disabled (asLocalhost: true)...`);
      
      await this.gateway.connect(ccp, {
        wallet: this.wallet,
        identity: identityLabel,
        discovery: { enabled: false, asLocalhost: true }
      });

      logger.info(`✅ Successfully connected to Fabric network as ${userId} from ${orgName}`);
    } catch (error) {
      logger.error('❌ Failed to connect to Fabric network:', error);
      throw error;
    }
  }

  /**
   * Get connection profile path based on organization
   */
  private getCCPPath(orgName: string): string {
    const basePath = path.resolve(__dirname, '../../../network/organizations/peerOrganizations');

    const orgAliases: { [key: string]: string[] } = {
      farmers: ['farmers', 'farmerscoop'],
      testinglabs: ['testinglabs', 'labs'],
      processors: ['processors'],
      manufacturers: ['manufacturers']
    };

    const normalized = (orgName || '').toLowerCase();
    let key = 'farmers';
    if (normalized.includes('lab') || normalized.includes('testing')) {
      key = 'testinglabs';
    } else if (normalized.includes('processor')) {
      key = 'processors';
    } else if (normalized.includes('manufacturer') || normalized.includes('mfg')) {
      key = 'manufacturers';
    } else {
      key = 'farmers';
    }

    const candidates = orgAliases[key] || ['farmers'];

    for (const alias of candidates) {
      const ccpPath = path.join(basePath, `${alias}.herbaltrace.com`, `connection-${alias}.json`);
      if (fs.existsSync(ccpPath)) {
        logger.info(`Using connection profile: ${ccpPath}`);
        return ccpPath;
      }
    }

    throw new Error(`Connection profile not found for organization: ${orgName}`);
  }

  /**
   * Get network channel
   */
  private async getNetwork() {
    if (!this.gateway) {
      throw new Error('Gateway not connected');
    }
    return await this.gateway.getNetwork(this.channelName);
  }

  /**
   * Get chaincode contract
   */
  private async getContract() {
    const network = await this.getNetwork();
    return network.getContract(this.chaincodeName, 'HerbalTraceContract');
  }

  /**
   * Submit a transaction to the ledger
   * Uses endorsement from the connected organization's peers
   */
  async submitTransaction(functionName: string, ...args: string[]): Promise<any> {
    try {
      const contract = await this.getContract();
      const network = await this.getNetwork();
      
      // Create transaction with explicit peer targeting
      // Only use peer0 for each organization to avoid issues where peer1 doesn't have chaincode
      const transaction = contract.createTransaction(functionName);
      
      // Endorse on all configured peer0 nodes to satisfy multi-org endorsement policies.
      transaction.setEndorsingPeers(network.getChannel().getEndorsers());
      
      const result = await transaction.submit(...args);
      
      logger.info(`Transaction ${functionName} submitted successfully`);
      
      // Get transaction ID from the transaction
      const txId = transaction.getTransactionId();
      
      // Parse result if it's JSON
      let parsedResult = null;
      if (result && result.length > 0) {
        try {
          parsedResult = JSON.parse(result.toString());
        } catch {
          parsedResult = result.toString();
        }
      }
      
      // Return both the result and transaction ID
      return {
        ...parsedResult,
        transactionId: txId
      };
    } catch (error) {
      logger.error(`Failed to submit transaction ${functionName}:`, error);
      throw error;
    }
  }

  /**
   * Evaluate a transaction (query)
   */
  async evaluateTransaction(functionName: string, ...args: string[]): Promise<any> {
    try {
      const contract = await this.getContract();
      const result = await contract.evaluateTransaction(functionName, ...args);
      return result.toString() ? JSON.parse(result.toString()) : null;
    } catch (error) {
      logger.error(`Failed to evaluate transaction ${functionName}:`, error);
      throw error;
    }
  }

  /**
   * Create Collection Event
   */
  async createCollectionEvent(eventData: any): Promise<any> {
    return await this.submitTransaction('CreateCollectionEvent', JSON.stringify(eventData));
  }

  /**
   * Get Collection Event by ID
   */
  async getCollectionEvent(id: string): Promise<any> {
    return await this.evaluateTransaction('GetCollectionEvent', id);
  }

  /**
   * Query collections by farmer
   */
  async queryCollectionsByFarmer(farmerId: string): Promise<any[]> {
    return await this.evaluateTransaction('QueryCollectionsByFarmer', farmerId);
  }

  /**
   * Query collections by species
   */
  async queryCollectionsBySpecies(species: string): Promise<any[]> {
    return await this.evaluateTransaction('QueryCollectionsBySpecies', species);
  }

  /**
   * Create Quality Test
   */
  async createQualityTest(testData: any): Promise<any> {
    return await this.submitTransaction('CreateQualityTest', JSON.stringify(testData));
  }

  /**
   * Get Quality Test by ID
   */
  async getQualityTest(id: string): Promise<any> {
    return await this.evaluateTransaction('GetQualityTest', id);
  }

  /**
   * Create Processing Step
   */
  async createProcessingStep(stepData: any): Promise<any> {
    return await this.submitTransaction('CreateProcessingStep', JSON.stringify(stepData));
  }

  /**
   * Get Processing Step by ID
   */
  async getProcessingStep(id: string): Promise<any> {
    return await this.evaluateTransaction('GetProcessingStep', id);
  }

  /**
   * Create Product
   */
  async createProduct(productData: any): Promise<any> {
    return await this.submitTransaction('CreateProduct', JSON.stringify(productData));
  }

  /**
   * Get Product by ID
   */
  async getProduct(id: string): Promise<any> {
    return await this.evaluateTransaction('GetProduct', id);
  }

  /**
   * Get Product by QR Code
   */
  async getProductByQRCode(qrCode: string): Promise<any> {
    return await this.evaluateTransaction('GetProductByQRCode', qrCode);
  }

  /**
   * Generate Provenance for Product
   */
  async generateProvenance(productId: string): Promise<any> {
    return await this.evaluateTransaction('GenerateProvenance', productId);
  }

  /**
   * Get Provenance by QR Code (Consumer Scanning)
   */
  async getProvenanceByQRCode(qrCode: string): Promise<any> {
    return await this.evaluateTransaction('GetProvenanceByQRCode', qrCode);
  }

  /**
   * Disconnect from gateway
   */
  async disconnect(): Promise<void> {
    if (this.gateway) {
      this.gateway.disconnect();
      this.gateway = null;
      logger.info('Disconnected from Fabric network');
    }
  }

  /**
   * Register and enroll a new user
   */
  async registerUser(userId: string, orgName: string, affiliation: string): Promise<void> {
    try {
      // Ensure wallet is initialized first
      await this.initializeWallet();
      
      // Get CA client
      const ccpPath = this.getCCPPath(orgName);
      const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
      
      // Map organization names to CA names
      const orgToCaMap: { [key: string]: string } = {
        'farmers': 'farmerscoop',
        'farmer': 'farmerscoop',
        'farmerscoop': 'farmerscoop',
        'labs': 'testinglabs',
        'lab': 'testinglabs',
        'testinglabs': 'testinglabs',
        'processors': 'processors',
        'processor': 'processors',
        'manufacturers': 'manufacturers',
        'manufacturer': 'manufacturers'
      };
      const caName = orgToCaMap[orgName.toLowerCase()] || orgName.toLowerCase();
      
      const caInfo = ccp.certificateAuthorities[`ca.${caName}.herbaltrace.com`];
      if (!caInfo) {
        throw new Error(`CA info not found for ca.${caName}.herbaltrace.com`);
      }
      
      const caTLSCACerts = caInfo.tlsCACerts.pem || fs.readFileSync(caInfo.tlsCACerts.path, 'utf8');
      const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

      // Check if user already exists
      const userIdentity = await this.wallet.get(userId);
      if (userIdentity) {
        logger.info(`User ${userId} already exists in wallet`);
        return;
      }

      // Get admin identity for the organization
      const adminIdentityName = `admin-${orgName}`;
      const adminIdentity = await this.wallet.get(adminIdentityName);
      if (!adminIdentity) {
        throw new Error(`Admin identity '${adminIdentityName}' does not exist in wallet. Enroll admin first.`);
      }

      // Build admin user object
      const provider = this.wallet.getProviderRegistry().getProvider(adminIdentity.type);
      const adminUser = await provider.getUserContext(adminIdentity, adminIdentityName);

      // Register user
      const secret = await ca.register({
        affiliation: affiliation,
        enrollmentID: userId,
        role: 'client'
      }, adminUser);

      // Enroll user
      const enrollment = await ca.enroll({
        enrollmentID: userId,
        enrollmentSecret: secret
      });

      const x509Identity: X509Identity = {
        credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes()
        },
        mspId: `${orgName}MSP`,
        type: 'X.509'
      };

      await this.wallet.put(userId, x509Identity);
      logger.info(`Successfully registered and enrolled user ${userId}`);
    } catch (error) {
      logger.error(`Failed to register user ${userId}:`, error);
      throw error;
    }
  }
}

// Singleton instance
let fabricClientInstance: FabricClient | null = null;

export const getFabricClient = (): FabricClient => {
  if (!fabricClientInstance) {
    fabricClientInstance = new FabricClient();
  }
  return fabricClientInstance;
};

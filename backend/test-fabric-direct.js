const path = require('path');
const { Wallets, Gateway } = require('fabric-network');
const fs = require('fs');

async function main() {
  try {
    const walletPath = path.resolve(__dirname, '../network/wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const basePeersDir = path.resolve(__dirname, '../network/organizations/peerOrganizations');
    const ordererTlsPath = path.resolve(__dirname, '../network/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem');
    const ordererTlsPem = fs.readFileSync(ordererTlsPath, 'utf8');

    const peerFarmersTls = fs.readFileSync(path.join(basePeersDir, 'farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt'), 'utf8');
    const peerLabsTls = fs.readFileSync(path.join(basePeersDir, 'labs.herbaltrace.com/peers/peer0.labs.herbaltrace.com/tls/ca.crt'), 'utf8');
    const peerProcessorsTls = fs.readFileSync(path.join(basePeersDir, 'processors.herbaltrace.com/peers/peer0.processors.herbaltrace.com/tls/ca.crt'), 'utf8');

    const ccp = {
      name: 'herbaltrace-multi',
      version: '1.0.0',
      client: {
        organization: 'farmers',
        connection: { timeout: { peer: { endorser: '300' }, orderer: '300' } }
      },
      organizations: {
        farmers: { mspid: 'FarmersCoopMSP', peers: ['peer0.farmers.herbaltrace.com'] },
        labs: { mspid: 'TestingLabsMSP', peers: ['peer0.labs.herbaltrace.com'] },
        processors: { mspid: 'ProcessorsMSP', peers: ['peer0.processors.herbaltrace.com'] }
      },
      peers: {
        'peer0.farmers.herbaltrace.com': {
          url: 'grpcs://localhost:7051',
          tlsCACerts: { pem: peerFarmersTls },
          grpcOptions: { 'ssl-target-name-override': 'peer0.farmers.herbaltrace.com', hostnameOverride: 'peer0.farmers.herbaltrace.com' }
        },
        'peer0.labs.herbaltrace.com': {
          url: 'grpcs://localhost:9051',
          tlsCACerts: { pem: peerLabsTls },
          grpcOptions: { 'ssl-target-name-override': 'peer0.labs.herbaltrace.com', hostnameOverride: 'peer0.labs.herbaltrace.com' }
        },
        'peer0.processors.herbaltrace.com': {
          url: 'grpcs://localhost:11051',
          tlsCACerts: { pem: peerProcessorsTls },
          grpcOptions: { 'ssl-target-name-override': 'peer0.processors.herbaltrace.com', hostnameOverride: 'peer0.processors.herbaltrace.com' }
        }
      },
      orderers: {
        'orderer.herbaltrace.com': {
          url: 'grpcs://localhost:7050',
          tlsCACerts: { pem: ordererTlsPem },
          grpcOptions: { 'ssl-target-name-override': 'orderer.herbaltrace.com', hostnameOverride: 'orderer.herbaltrace.com' }
        }
      },
      channels: {
        'herbaltrace-channel': {
          orderers: ['orderer.herbaltrace.com'],
          peers: {
            'peer0.farmers.herbaltrace.com': {},
            'peer0.labs.herbaltrace.com': {},
            'peer0.processors.herbaltrace.com': {}
          }
        }
      }
    };

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: 'admin-Farmers',
      discovery: { enabled: false, asLocalhost: true }
    });

    const network = await gateway.getNetwork('herbaltrace-channel');
    const contract = network.getContract('herbaltrace', 'HerbalTraceContract');
    const endorsers = network.getChannel().getEndorsers();

    async function submitTx(fn, payload) {
      const tx = contract.createTransaction(fn);
      tx.setEndorsingPeers(endorsers);
      const res = await tx.submit(typeof payload === 'string' ? payload : JSON.stringify(payload));
      return { txId: tx.getTransactionId(), res: res.toString() };
    }

    const ts = Date.now();
    const colId = `COL-E2E-${ts}`;
    const batchId = `BATCH-TULSI-${ts}`;
    const testId = `QCT-${ts}`;
    const certId = `CERT-${ts}`;
    const procId = `PROC-${ts}`;
    const prodId = `PROD-${ts}`;
    const qrCode = `QR-${ts}-TEST`;

    // 1. Collection
    console.log('1. Submitting CollectionEvent...');
    const colPayload = {
      id: colId,
      type: 'CollectionEvent',
      farmerId: 'farmer-001',
      farmerName: 'Fresh Farmer User',
      species: 'Tulsi',
      commonName: 'Holy Basil',
      scientificName: 'Ocimum tenuiflorum',
      quantity: 5.0,
      unit: 'kg',
      latitude: 28.6139,
      longitude: 77.2090,
      altitude: 250.0,
      accuracy: 5.0,
      zoneName: 'Dehradun',
      harvestDate: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      harvestMethod: 'manual',
      partCollected: 'leaf',
      weatherConditions: 'clear',
      soilType: 'loamy',
      images: ['ipfs://sample-tulsi-image-hash'],
      approvedZone: true,
      conservationStatus: 'Least Concern',
      certificationIds: ['CERT-ORG-2026-001'],
      status: 'pending',
      nextStepId: testId
    };
    const colRes = await submitTx('CreateCollectionEvent', colPayload);
    console.log('✅ Collection TX:', colRes.txId);

    // 2. Quality Test
    console.log('2. Submitting QualityTest...');
    const testPayload = {
      id: testId,
      type: 'QualityTest',
      collectionEventId: colId,
      batchId: batchId,
      labId: 'lab-001',
      labName: 'TestingLabs',
      testDate: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      testTypes: ['moisture', 'heavy_metals'],
      moistureContent: 8.2,
      heavyMetals: { lead: 0.1, arsenic: 0.05 },
      pesticideResults: { organophosphates: 'pass' },
      dnaBarcodeMatch: true,
      dnaSequence: 'ATCGTTAGC',
      microbialLoad: 50.0,
      aflatoxins: 1.0,
      overallResult: 'pass',
      certificateId: certId,
      certificateUrl: `https://herbaltrace.com/certs/${certId}`,
      testerName: 'Dr. Lab Tester',
      testerSignature: 'SIG-LAB-TESTER',
      status: 'approved',
      nextStepId: procId
    };
    const testRes = await submitTx('CreateQualityTest', testPayload);
    console.log('✅ Lab Test TX:', testRes.txId);

    // 3. QC Certificate
    console.log('3. Submitting QCCertificate...');
    const certPayload = {
      certificateId: certId,
      testId: testId,
      batchId: batchId,
      issuedBy: 'TestingLabs',
      issueDate: new Date().toISOString(),
      qualityGrade: 'A',
      overallResult: 'PASS',
      signature: 'SIG-CERT-001',
      status: 'VALID'
    };
    const certRes = await submitTx('RecordQCCertificate', JSON.stringify(certPayload));
    console.log('✅ Certificate TX:', certRes.txId);

    // 4. Processing Step
    console.log('4. Submitting ProcessingStep...');
    const procPayload = {
      id: procId,
      type: 'ProcessingStep',
      previousStepId: testId,
      batchId: batchId,
      processorId: 'proc-001',
      processorName: 'Herbal Processors Ltd',
      processType: 'drying',
      processDate: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      inputQuantity: 5.0,
      outputQuantity: 4.8,
      unit: 'kg',
      temperature: 45.0,
      duration: 4.0,
      equipment: 'Vacuum Dryer',
      parameters: { speed: 'medium' },
      qualityChecks: ['moisture_check_passed'],
      operatorId: 'op-001',
      operatorName: 'John Operator',
      location: 'Dehradun Facility',
      latitude: 30.2688,
      longitude: 77.9932,
      status: 'completed',
      nextStepId: prodId
    };
    const procRes = await submitTx('CreateProcessingStep', procPayload);
    console.log('✅ Processing TX:', procRes.txId);

    // 5. Product
    console.log('5. Submitting Product...');
    const prodPayload = {
      id: prodId,
      type: 'Product',
      batchId: batchId,
      collectionEventIds: [colId],
      qualityTestIds: [testId],
      processingStepIds: [procId],
      productName: 'Organic Tulsi Powder',
      brand: 'HerbalPure',
      productType: 'Powder',
      category: 'Ayurvedic Herb',
      dosageForm: 'Powder',
      sku: `SKU-${ts}`,
      gtin: `0123456789${String(ts).slice(-4)}`,
      quantity: 4.8,
      unit: 'kg',
      unitSize: '100g',
      packageCount: 48,
      packagingType: 'Glass Jar',
      manufactureDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365*86400000).toISOString(),
      bestBeforeMonths: 12,
      ingredients: ['Tulsi Leaf (Ocimum tenuiflorum) 100%'],
      certifications: ['India Organic', 'GMP', 'ISO 9001'],
      qualityGrade: 'A+',
      qrCode: qrCode,
      barcode: `89012345${String(ts).slice(-5)}`,
      nfcTagId: '',
      manufacturerId: 'mfg-001',
      manufacturerName: 'HerbalPure Manufacturing Ltd',
      manufacturingFacility: 'Dehradun Unit 1',
      facilityLicense: 'LIC-AYUSH-2026-098',
      regulatoryApprovals: ['AYUSH-OK'],
      status: 'manufactured',
      verificationCount: 0,
      lastVerifiedAt: '',
      carbonFootprint: 0.25,
      fairTradeCertified: true,
      recycledPackagingPercent: 80.0,
      timestamp: new Date().toISOString()
    };
    const prodRes = await submitTx('CreateProduct', prodPayload);
    console.log('✅ Product TX:', prodRes.txId);

    // 6. QR Code Query
    console.log('6. Querying GetProductByQRCode...');
    const prodRead = await contract.evaluateTransaction('GetProductByQRCode', qrCode);
    console.log('✅ Product verified by QR from blockchain:', JSON.parse(prodRead.toString()).productName);

    // 7. Provenance Query
    console.log('7. Querying GetProvenanceByQRCode...');
    const provRead = await contract.evaluateTransaction('GetProvenanceByQRCode', qrCode);
    console.log('✅ Provenance read from blockchain:', JSON.parse(provRead.toString()));

    await gateway.disconnect();
    console.log('\n🎉🎉 COMPLETE END-TO-END SMART CONTRACT PIPELINE VERIFIED ON BLOCKCHAIN!');
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

main();

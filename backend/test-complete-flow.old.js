/**
 * Complete End-to-End Testing Script
 * Tests the entire flow: Farmer -> Batch -> Lab -> Manufacturer -> QR -> Consumer
 */

const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000/api/v1';
let authToken = '';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function section(message) {
  log(`\n${'='.repeat(70)}`, 'yellow');
  log(`  ${message}`, 'yellow');
  log(`${'='.repeat(70)}\n`, 'yellow');
}

async function login() {
  section('Step 1: Admin Login');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123',
    });
    authToken = response.data.token;
    success(`Logged in as: ${response.data.user.fullName}`);
    return response.data.user;
  } catch (err) {
    error(`Login failed: ${err.message}`);
    throw err;
  }
}

async function getBatches() {
  section('Step 2: Get Available Batches');
  try {
    const response = await axios.get(`${BASE_URL}/batches`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    const qualityTestedBatches = response.data.data.filter(b => b.status === 'quality_tested');
    
    info(`Total batches: ${response.data.data.length}`);
    info(`Quality tested batches: ${qualityTestedBatches.length}`);
    
    if (qualityTestedBatches.length > 0) {
      const batch = qualityTestedBatches[0];
      success(`Found batch ready for manufacturing: ${batch.batch_number}`);
      console.log(`   Species: ${batch.species}`);
      console.log(`   Quantity: ${batch.total_quantity} ${batch.unit}`);
      console.log(`   Status: ${batch.status}`);
      return batch;
    } else {
      error('No quality-tested batches found. Need to complete lab testing first.');
      return null;
    }
  } catch (err) {
    error(`Get batches failed: ${err.message}`);
    return null;
  }
}

async function createProduct(batch) {
  if (!batch) {
    error('Cannot create product without a batch');
    return null;
  }

  section(`Step 3: Create Product from Batch ${batch.batch_number}`);
  
  try {
    const productData = {
      batchId: batch.id,
      productName: `Premium ${batch.species} Extract`,
      productType: 'extract',
      quantity: batch.total_quantity * 0.8, // 80% yield
      unit: batch.unit,
      manufactureDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year
      ingredients: [batch.species, 'Distilled Water', 'Natural Preservatives'],
      certifications: ['Organic', 'AYUSH Certified'],
      processingSteps: [
        {
          processType: 'drying',
          temperature: 50,
          duration: 24,
          equipment: 'Industrial Dryer',
          notes: 'Dried at controlled temperature',
        },
        {
          processType: 'grinding',
          temperature: 25,
          duration: 2,
          equipment: 'Pulverizer',
          notes: 'Ground to fine powder',
        },
        {
          processType: 'extraction',
          temperature: 60,
          duration: 48,
          equipment: 'Extraction Unit',
          notes: 'Water-based extraction',
        },
      ],
    };

    info('Creating product...');
    const response = await axios.post(`${BASE_URL}/manufacturer/products`, productData, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const product = response.data.data;
    success(`Product created successfully!`);
    console.log(`   Product ID: ${product.id}`);
    console.log(`   Product Name: ${product.productName}`);
    console.log(`   QR Code: ${product.qrCode}`);
    console.log(`   Blockchain TX: ${product.blockchainTxId || 'Pending'}`);
    console.log(`   Collections: ${product.collectionCount}`);
    console.log(`   QC Tests: ${product.qcTestCount}`);
    console.log(`   Processing Steps: ${product.processingStepCount}`);
    console.log(`   Verification URL: ${product.verificationUrl}`);

    return product;
  } catch (err) {
    error(`Product creation failed: ${err.response?.data?.message || err.message}`);
    if (err.response?.data) {
      console.log(JSON.stringify(err.response.data, null, 2));
    }
    return null;
  }
}

async function verifyQRCode(qrCode) {
  section(`Step 4: Consumer Verification of QR Code`);
  
  try {
    info(`Scanning QR Code: ${qrCode}`);
    const response = await axios.get(`${BASE_URL}/qr/verify/${qrCode}`);

    const provenance = response.data.data;
    success(`QR Code verified successfully!`);
    
    console.log(`\n📦 PRODUCT INFORMATION:`);
    console.log(`   Name: ${provenance.product.name}`);
    console.log(`   Type: ${provenance.product.type}`);
    console.log(`   Quantity: ${provenance.product.quantity} ${provenance.product.unit}`);
    console.log(`   Manufacturer: ${provenance.product.manufacturer}`);
    console.log(`   Manufacture Date: ${provenance.product.manufactureDate}`);
    console.log(`   Expiry Date: ${provenance.product.expiryDate}`);
    console.log(`   Ingredients: ${provenance.product.ingredients.join(', ')}`);
    
    console.log(`\n🌾 BATCH INFORMATION:`);
    console.log(`   Batch Number: ${provenance.batch.batchNumber}`);
    console.log(`   Species: ${provenance.batch.species}`);
    console.log(`   Total Quantity: ${provenance.batch.totalQuantity} ${provenance.batch.unit}`);
    console.log(`   Collections: ${provenance.batch.collectionCount}`);
    
    console.log(`\n🚜 FARMER COLLECTIONS:`);
    provenance.collections.forEach((c, idx) => {
      console.log(`   Collection #${idx + 1}:`);
      console.log(`     Farmer: ${c.farmerName || c.farmerId}`);
      console.log(`     Quantity: ${c.quantity} ${c.unit}`);
      console.log(`     Location: ${c.location.zoneName || 'Unknown'} (${c.location.latitude}, ${c.location.longitude})`);
      console.log(`     Harvest Date: ${c.harvestDate}`);
      console.log(`     Method: ${c.harvestMethod || 'N/A'}`);
      console.log(`     Blockchain TX: ${c.blockchainTx || 'Pending'}`);
    });
    
    console.log(`\n🔬 QUALITY TESTS:`);
    if (provenance.qualityTests.length > 0) {
      provenance.qualityTests.forEach((t, idx) => {
        console.log(`   Test #${idx + 1}:`);
        console.log(`     Lab: ${t.labName}`);
        console.log(`     Type: ${t.testType}`);
        console.log(`     Result: ${t.overallResult || 'Pending'}`);
        console.log(`     Certificate: ${t.certificateNumber || 'N/A'}`);
      });
    } else {
      console.log(`   No quality tests recorded`);
    }
    
    console.log(`\n🔗 BLOCKCHAIN:`);
    console.log(`   Product TX: ${provenance.product.blockchainTx || 'Pending'}`);
    console.log(`   Blockchain Available: ${provenance.blockchain.available !== false ? 'Yes' : 'No'}`);
    
    return provenance;
  } catch (err) {
    error(`QR verification failed: ${err.response?.data?.message || err.message}`);
    if (err.response?.status === 404) {
      error('QR Code not found in system');
    }
    return null;
  }
}

async function generateQRCodeImage(product) {
  section(`Step 5: Generate QR Code Image`);
  
  if (!product || !product.qrCodeImage) {
    error('No QR code image available');
    return;
  }

  try {
    // Extract base64 data and save to file
    const base64Data = product.qrCodeImage.replace(/^data:image\/png;base64,/, '');
    const qrFilePath = `./qr-${product.qrCode}.png`;
    
    fs.writeFileSync(qrFilePath, base64Data, 'base64');
    success(`QR Code image saved to: ${qrFilePath}`);
    info(`You can scan this QR code or access: ${product.verificationUrl}`);
  } catch (err) {
    error(`Failed to save QR image: ${err.message}`);
  }
}

async function runCompleteTest() {
  try {
    console.log('\n');
    log('╔═══════════════════════════════════════════════════════════════════╗', 'blue');
    log('║   HERBALTRACE END-TO-END TESTING                                  ║', 'blue');
    log('║   Testing: Farmer → Batch → Lab → Manufacturer → QR → Consumer   ║', 'blue');
    log('╚═══════════════════════════════════════════════════════════════════╝', 'blue');
    console.log('\n');

    // Step 1: Login
    await login();

    // Step 2: Get quality-tested batch
    const batch = await getBatches();
    if (!batch) {
      error('\n⚠️  No quality-tested batches available.');
      info('Please ensure:');
      info('  1. Farmer has submitted collections');
      info('  2. Admin has created batches from collections');
      info('  3. Lab has completed QC tests and issued certificates');
      return;
    }

    // Step 3: Create product
    const product = await createProduct(batch);
    if (!product) {
      error('\n⚠️  Product creation failed. Check errors above.');
      return;
    }

    // Step 4: Verify QR code (consumer perspective)
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    const provenance = await verifyQRCode(product.qrCode);
    
    // Step 5: Generate QR image
    await generateQRCodeImage(product);

    // Summary
    section('TESTING COMPLETE');
    if (provenance) {
      success('✅ All steps completed successfully!');
      info(`\nNext steps:`);
      info(`  1. Print the QR code from: qr-${product.qrCode}.png`);
      info(`  2. Scan with mobile app or visit: ${product.verificationUrl}`);
      info(`  3. Verify all traceability data is displayed correctly`);
    } else {
      error('⚠️  Some steps failed. Review errors above.');
    }

  } catch (err) {
    error(`\n❌ Test failed with error: ${err.message}`);
    console.error(err);
  }
}

// Run the test
runCompleteTest();

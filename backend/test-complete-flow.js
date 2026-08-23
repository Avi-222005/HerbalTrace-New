// Complete End-to-End Flow Test - Farmer to QR Generation
// This test runs the complete workflow without frontend

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(emoji, message, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`\n${colors.bright}${colors.blue}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}STEP ${step}: ${message}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${'='.repeat(70)}${colors.reset}\n`);
}

function logError(message, details) {
  console.log(`\n${colors.red}❌ TEST FAILED${colors.reset}`);
  console.log(`   ${colors.red}Error: ${message}${colors.reset}`);
  if (details) {
    console.log(`   ${colors.red}Details: ${JSON.stringify(details, null, 2)}${colors.reset}`);
  }
}

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

let tokens = {};
let collectionId, batchId, qcTestId, certificateId, productId, qrCode;

async function login(username, password, role) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username,
      password
    });
    tokens[role] = response.data.data.token;
    logSuccess(`${role} logged in: ${response.data.data.user.full_name || username}`);
    return response.data.data;
  } catch (error) {
    throw new Error(`Login failed for ${role}: ${error.response?.data?.message || error.message}`);
  }
}

async function createCollection(farmerToken) {
  try {
    const collectionData = {
      species: 'Ashwagandha',
      quantity: 25.5,
      unit: 'kg',
      collectionDate: '2025-12-08',
      location: 'Rajasthan Organic Farm',
      qualityNotes: 'Premium quality roots, hand-picked at optimal maturity'
    };
    
    const response = await axios.post(
      `${BASE_URL}/collections`,
      collectionData,
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    );
    
    collectionId = response.data.data.id;
    logSuccess(`Collection created: ${collectionId}`);
    log('  📍', `Herb: ${collectionData.species}`, colors.cyan);
    log('  📍', `Quantity: ${collectionData.quantity} ${collectionData.unit}`, colors.cyan);
    log('  📍', `Location: ${collectionData.location}`, colors.cyan);
    
    return response.data.data;
  } catch (error) {
    throw new Error(`Collection creation failed: ${error.response?.data?.message || error.message}`);
  }
}

async function createBatch(farmerToken) {
  try {
    // Get farmer's collections first
    const collectionsResponse = await axios.get(
      `${BASE_URL}/collections`,
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    );
    
    const collections = collectionsResponse.data.data;
    if (!collections || collections.length === 0) {
      throw new Error('No collections available to create batch');
    }
    
    // Use the collection we just created
    const collection = collections.find(c => c.id === collectionId) || collections[0];
    
    const batchData = {
      collectionIds: [collection.id],
      species: collection.species,
      expectedQuantity: collection.quantity,
      unit: collection.unit,
      notes: 'Combined batch from organic farm collection'
    };
    
    const response = await axios.post(
      `${BASE_URL}/batches`,
      batchData,
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    );
    
    batchId = response.data.data.id;
    logSuccess(`Batch created: ${batchId}`);
    log('  📦', `Species: ${batchData.species}`, colors.cyan);
    log('  📦', `Quantity: ${batchData.expectedQuantity} ${batchData.unit}`, colors.cyan);
    log('  📦', `Collections: ${batchData.collectionIds.length}`, colors.cyan);
    
    return response.data.data;
  } catch (error) {
    throw new Error(`Batch creation failed: ${error.response?.data?.message || error.message}`);
  }
}

async function createQCTest(labToken) {
  try {
    const testData = {
      batch_id: batchId,
      test_type: 'COMPREHENSIVE',
      priority: 'HIGH',
      scheduled_date: '2025-12-09',
      parameters: [
        {
          parameter_name: 'Moisture Content',
          parameter_type: 'RANGE',
          expected_min: 8.0,
          expected_max: 12.0,
          unit: '%',
          description: 'Acceptable moisture range for dried herbs'
        },
        {
          parameter_name: 'Active Withanolides',
          parameter_type: 'RANGE',
          expected_min: 2.5,
          expected_max: 5.0,
          unit: '%',
          description: 'Primary active compound concentration'
        },
        {
          parameter_name: 'Heavy Metals (Lead)',
          parameter_type: 'NUMERIC',
          expected_min: 0,
          expected_max: 10,
          unit: 'ppm',
          description: 'Maximum allowable lead content'
        },
        {
          parameter_name: 'Microbial Count',
          parameter_type: 'NUMERIC',
          expected_min: 0,
          expected_max: 100000,
          unit: 'CFU/g',
          description: 'Total plate count'
        },
        {
          parameter_name: 'Pesticide Residue',
          parameter_type: 'NUMERIC',
          expected_min: 0,
          expected_max: 0.5,
          unit: 'ppm',
          description: 'Multi-residue pesticide analysis'
        }
      ]
    };
    
    const response = await axios.post(
      `${BASE_URL}/lab/tests`,
      testData,
      { headers: { Authorization: `Bearer ${labToken}` } }
    );
    
    qcTestId = response.data.data.test_id;
    logSuccess(`QC Test created: ${qcTestId}`);
    log('  🧪', `Type: ${testData.test_type}`, colors.cyan);
    log('  🧪', `Priority: ${testData.priority}`, colors.cyan);
    log('  🧪', `Parameters: ${testData.parameters.length}`, colors.cyan);
    
    return response.data.data;
  } catch (error) {
    throw new Error(`QC test creation failed: ${error.response?.data?.message || error.message}`);
  }
}

async function submitTestResults(labToken) {
  try {
    const resultsData = {
      test_id: qcTestId,
      results: [
        {
          parameter_name: 'Moisture Content',
          measured_value: '10.2',
          measured_numeric: 10.2,
          unit: '%',
          pass_fail: 'PASS',
          remarks: 'Within acceptable range'
        },
        {
          parameter_name: 'Active Withanolides',
          measured_value: '3.8',
          measured_numeric: 3.8,
          unit: '%',
          pass_fail: 'PASS',
          remarks: 'Excellent potency level'
        },
        {
          parameter_name: 'Heavy Metals (Lead)',
          measured_value: '2.1',
          measured_numeric: 2.1,
          unit: 'ppm',
          pass_fail: 'PASS',
          remarks: 'Well below safety limit'
        },
        {
          parameter_name: 'Microbial Count',
          measured_value: '45000',
          measured_numeric: 45000,
          unit: 'CFU/g',
          pass_fail: 'PASS',
          remarks: 'Acceptable microbial load'
        },
        {
          parameter_name: 'Pesticide Residue',
          measured_value: '0.1',
          measured_numeric: 0.1,
          unit: 'ppm',
          pass_fail: 'PASS',
          remarks: 'No significant pesticide detected'
        }
      ]
    };
    
    const response = await axios.post(
      `${BASE_URL}/lab/tests/${qcTestId}/results`,
      resultsData,
      { headers: { Authorization: `Bearer ${labToken}` } }
    );
    
    logSuccess('Test results submitted successfully');
    log('  📊', `Results: ${resultsData.results.length} parameters`, colors.cyan);
    log('  📊', `Status: All PASS`, colors.green);
    
    return response.data.data;
  } catch (error) {
    throw new Error(`Results submission failed: ${error.response?.data?.message || error.message}`);
  }
}

async function generateCertificate(labToken) {
  try {
    const certData = {
      test_id: qcTestId,
      certificate_type: 'QUALITY',
      remarks: 'Batch meets all quality standards for Ashwagandha root powder. Recommended for pharmaceutical grade applications.',
      valid_until: '2026-12-08'
    };
    
    const response = await axios.post(
      `${BASE_URL}/lab/certificates`,
      certData,
      { headers: { Authorization: `Bearer ${labToken}` } }
    );
    
    certificateId = response.data.data.certificate_id;
    const blockchainTxId = response.data.data.blockchain_tx_id;
    
    logSuccess(`Certificate generated: ${certificateId}`);
    if (blockchainTxId) {
      log('  ⛓️', `Blockchain TX: ${blockchainTxId}`, colors.green);
    } else {
      log('  ⚠️', 'Blockchain offline - certificate stored locally', colors.yellow);
    }
    log('  📜', `Valid until: ${certData.valid_until}`, colors.cyan);
    
    return response.data.data;
  } catch (error) {
    throw new Error(`Certificate generation failed: ${error.response?.data?.message || error.message}`);
  }
}

async function createProduct(manufacturerToken) {
  try {
    const productData = {
      batch_id: batchId,
      product_name: 'Premium Ashwagandha Root Powder',
      product_type: 'POWDER',
      quantity: 25.0,
      unit: 'kg',
      manufacturing_date: '2025-12-08',
      expiry_date: '2026-12-08',
      storage_conditions: 'Store in cool, dry place away from direct sunlight',
      ingredients: JSON.stringify(['Ashwagandha Root Powder (Withania somnifera)', '100% Pure']),
      dosage_instructions: 'Take 1-2 teaspoons daily with warm water or milk'
    };
    
    const response = await axios.post(
      `${BASE_URL}/manufacturer/products`,
      productData,
      { headers: { Authorization: `Bearer ${manufacturerToken}` } }
    );
    
    productId = response.data.data.product_id;
    qrCode = response.data.data.qr_code;
    const blockchainTxId = response.data.data.blockchain_tx_id;
    
    logSuccess(`Product created: ${productId}`);
    log('  🏭', `Name: ${productData.product_name}`, colors.cyan);
    log('  🏭', `Type: ${productData.product_type}`, colors.cyan);
    log('  🏭', `Quantity: ${productData.quantity} ${productData.unit}`, colors.cyan);
    logSuccess(`QR Code generated: ${qrCode}`);
    if (blockchainTxId) {
      log('  ⛓️', `Blockchain TX: ${blockchainTxId}`, colors.green);
    } else {
      log('  ⚠️', 'Blockchain offline - product stored locally', colors.yellow);
    }
    
    return response.data.data;
  } catch (error) {
    throw new Error(`Product creation failed: ${error.response?.data?.message || error.message}`);
  }
}

async function verifyQRCode() {
  try {
    const response = await axios.get(`${BASE_URL}/verify/${qrCode}`);
    
    const data = response.data.data;
    logSuccess('QR Code verified successfully!');
    log('  🔍', `Product: ${data.product?.product_name}`, colors.cyan);
    log('  🔍', `Batch: ${data.batch?.batch_id}`, colors.cyan);
    log('  🔍', `Herb: ${data.collections[0]?.herb_name}`, colors.cyan);
    log('  🔍', `Farmer: ${data.farmer?.full_name}`, colors.cyan);
    log('  🔍', `Lab: ${data.lab?.full_name}`, colors.cyan);
    log('  🔍', `Certificate: ${data.certificate?.certificate_id}`, colors.cyan);
    
    if (data.blockchain_verified) {
      log('  ⛓️', 'Blockchain verification: PASSED', colors.green);
    } else {
      log('  ⚠️', 'Blockchain offline - using local verification', colors.yellow);
    }
    
    return data;
  } catch (error) {
    throw new Error(`QR verification failed: ${error.response?.data?.message || error.message}`);
  }
}

async function runCompleteFlow() {
  console.log(`\n${colors.bright}${colors.green}${'='.repeat(70)}`);
  console.log(`  🌿 HERBALTRACE - COMPLETE END-TO-END FLOW TEST`);
  console.log(`  Farm to Consumer with QR Generation`);
  console.log(`${'='.repeat(70)}${colors.reset}\n`);
  
  try {
    // STEP 1: Login all users
    logStep(1, 'User Authentication');
    await login('admin', 'admin123', 'admin');
    await login('avinashverma', 'avinash123', 'farmer');
    await login('labtest', 'lab123', 'lab');
    await login('manufacturer', 'manufacturer123', 'manufacturer');
    
    // STEP 2: Farmer creates collection
    logStep(2, 'Farmer Collection');
    log('👨‍🌾', 'Farmer collecting herbs from farm...', colors.cyan);
    await createCollection(tokens.farmer);
    
    // STEP 3: Farmer creates batch
    logStep(3, 'Batch Creation');
    log('📦', 'Creating batch from collection...', colors.cyan);
    await createBatch(tokens.farmer);
    
    // STEP 4: Lab creates QC test
    logStep(4, 'Lab Quality Testing - Create Test');
    log('🧪', 'Lab scheduling quality control test...', colors.cyan);
    await createQCTest(tokens.lab);
    
    // STEP 5: Lab submits results
    logStep(5, 'Lab Quality Testing - Submit Results');
    log('📊', 'Lab performing tests and recording results...', colors.cyan);
    await submitTestResults(tokens.lab);
    
    // STEP 6: Lab generates certificate
    logStep(6, 'Certificate Generation');
    log('📜', 'Generating quality certificate...', colors.cyan);
    await generateCertificate(tokens.lab);
    
    // STEP 7: Manufacturer creates product
    logStep(7, 'Product Manufacturing');
    log('🏭', 'Manufacturer creating final product...', colors.cyan);
    await createProduct(tokens.manufacturer);
    
    // STEP 8: Verify QR code
    logStep(8, 'Consumer QR Verification');
    log('🔍', 'Consumer scanning QR code...', colors.cyan);
    await verifyQRCode();
    
    // Final Summary
    console.log(`\n${colors.bright}${colors.green}${'='.repeat(70)}`);
    console.log(`  ✨ COMPLETE FLOW TEST PASSED! ✨`);
    console.log(`${'='.repeat(70)}${colors.reset}\n`);
    
    console.log(`${colors.bright}📊 FLOW SUMMARY:${colors.reset}\n`);
    console.log(`   ${colors.green}✅ Collection ID:${colors.reset}  ${collectionId}`);
    console.log(`   ${colors.green}✅ Batch ID:${colors.reset}       ${batchId}`);
    console.log(`   ${colors.green}✅ QC Test ID:${colors.reset}     ${qcTestId}`);
    console.log(`   ${colors.green}✅ Certificate ID:${colors.reset} ${certificateId}`);
    console.log(`   ${colors.green}✅ Product ID:${colors.reset}     ${productId}`);
    console.log(`   ${colors.green}✅ QR Code:${colors.reset}        ${qrCode}`);
    
    console.log(`\n${colors.bright}🎯 QR CODE FOR TESTING:${colors.reset}`);
    console.log(`   ${colors.cyan}${qrCode}${colors.reset}`);
    console.log(`\n${colors.bright}🔗 Verification URL:${colors.reset}`);
    console.log(`   ${colors.cyan}${BASE_URL}/verify/${qrCode}${colors.reset}`);
    
    console.log(`\n${colors.bright}${colors.green}✅ ALL STEPS COMPLETED SUCCESSFULLY!${colors.reset}`);
    console.log(`${colors.green}✅ QR CODE GENERATED AND VERIFIED!${colors.reset}`);
    console.log(`${colors.green}✅ COMPLETE TRACEABILITY WORKING!${colors.reset}\n`);
    
    process.exit(0);
    
  } catch (error) {
    logError(error.message, error.response?.data);
    process.exit(1);
  }
}

// Run the test
runCompleteFlow();

const axios = require('axios');
const BASE_URL = 'http://localhost:3000/api/v1';

console.log('\n' + '='.repeat(70));
console.log('  🧪 COMPLETE WORKFLOW TEST - Farm to Consumer');
console.log('='.repeat(70) + '\n');

let tokens = {};
let testData = {};

async function login(username, password, role) {
  console.log(`\n🔐 Logging in as ${role}...`);
  const res = await axios.post(`${BASE_URL}/auth/login`, { username, password });
  tokens[role] = res.data.data.token;
  console.log(`✅ ${role} logged in: ${res.data.data.user.fullName}`);
  return res.data.data.user; // Return user info
}

async function runWorkflowTest() {
  try {
    // Step 1: Login all users
    const adminData = await login('admin', 'admin123', 'admin');
    const farmerData = await login('avinashverma', 'avinash123', 'farmer');
    const labData = await login('labtest', 'lab123', 'lab');
    const mfgData = await login('manufacturer', 'manufacturer123', 'manufacturer');
    
    // Store user info
    testData.labUserId = labData.userId;
    testData.labUserName = labData.fullName;

    // Step 2: Get existing batch
    console.log('\n📦 Fetching existing batch...');
    const batchesRes = await axios.get(`${BASE_URL}/batches`, {
      headers: { Authorization: `Bearer ${tokens.farmer}` }
    });
    
    if (batchesRes.data.count === 0) {
      throw new Error('No batches available. Create a batch first.');
    }
    
    const batch = batchesRes.data.data[0];
    testData.batchId = batch.id;
    testData.batchNumber = batch.batch_number;
    console.log(`✅ Found batch: ${batch.batch_number} (${batch.species})`);
    console.log(`   Status: ${batch.status}`);
    console.log(`   Quantity: ${batch.total_quantity} ${batch.unit}`);

    // Step 3: Create QC Test (Lab)
    console.log('\n🧪 Creating QC Test...');
    
    const testPayload = {
      batch_id: testData.batchId,
      lab_id: testData.labUserId,
      lab_name: testData.labUserName,
      test_type: 'PURITY',
      species: batch.species,
      sample_quantity: 100,
      sample_unit: 'g',
      priority: 'HIGH',
      notes: 'Automated test creation for hackathon demo',
      parameters: [
        {
          parameter_name: 'Moisture Content',
          parameter_type: 'RANGE',
          expected_value: '10%',
          expected_min: 8,
          expected_max: 12,
          unit: '%',
          description: 'Gravimetric method - Moisture Content Test'
        },
        {
          parameter_name: 'Active Compounds',
          parameter_type: 'NUMERIC',
          expected_min: 2,
          unit: '%',
          description: 'HPLC method - Active compound analysis'
        },
        {
          parameter_name: 'Heavy Metals',
          parameter_type: 'NUMERIC',
          expected_max: 10,
          unit: 'ppm',
          description: 'AAS method - Heavy metal detection'
        },
        {
          parameter_name: 'Microbial Load',
          parameter_type: 'NUMERIC',
          expected_max: 1000,
          unit: 'CFU/g',
          description: 'Plate Count method - Microbial testing'
        }
      ]
    };

    const createTestRes = await axios.post(`${BASE_URL}/qc/tests`, testPayload, {
      headers: { Authorization: `Bearer ${tokens.lab}` }
    });
    
    testData.testId = createTestRes.data.data.id;
    console.log(`✅ QC Test created: ${testData.testId}`);

    // Step 4: Submit test results
    console.log('\n📝 Submitting test results...');
    const resultsPayload = {
      results: [
        { 
          parameter_name: 'Moisture Content',
          measured_value: '10.5%',
          measured_numeric: 10.5,
          unit: '%',
          pass_fail: 'PASS',
          remarks: 'Within acceptable range'
        },
        {
          parameter_name: 'Active Compounds',
          measured_value: '2.8%',
          measured_numeric: 2.8,
          unit: '%',
          pass_fail: 'PASS',
          remarks: 'Above minimum threshold'
        },
        {
          parameter_name: 'Heavy Metals',
          measured_value: '5 ppm',
          measured_numeric: 5,
          unit: 'ppm',
          pass_fail: 'PASS',
          remarks: 'Below maximum limit'
        },
        {
          parameter_name: 'Microbial Load',
          measured_value: '800 CFU/g',
          measured_numeric: 800,
          unit: 'CFU/g',
          pass_fail: 'PASS',
          remarks: 'Below maximum limit'
        }
      ]
    };

    await axios.post(`${BASE_URL}/qc/tests/${testData.testId}/results`, resultsPayload, {
      headers: { Authorization: `Bearer ${tokens.lab}` }
    });
    console.log('✅ Test results submitted successfully');

    // Step 5: Generate certificate (with blockchain recording)
    console.log('\n📜 Generating QC Certificate...');
    const certRes = await axios.post(`${BASE_URL}/qc/tests/${testData.testId}/certificate`, {}, {
      headers: { Authorization: `Bearer ${tokens.lab}` }
    });
    
    testData.certificateId = certRes.data.data.id;
    console.log(`✅ Certificate generated: ${testData.certificateId}`);
    if (certRes.data.data.blockchain_txid) {
      console.log(`   ⛓️  Blockchain TX: ${certRes.data.data.blockchain_txid.substring(0, 20)}...`);
    }

    // Step 6: Create Product (Manufacturer)
    console.log('\n🏭 Creating Product...');
    
    // First check if batch is now quality_tested
    const updatedBatchRes = await axios.get(`${BASE_URL}/batches/${testData.batchId}`, {
      headers: { Authorization: `Bearer ${tokens.manufacturer}` }
    });
    
    console.log(`   Batch status: ${updatedBatchRes.data.data.status}`);
    
    const productPayload = {
      batchId: testData.batchId,
      productName: `Premium ${batch.species} Powder`,
      productType: 'powder',
      quantity: parseFloat(batch.total_quantity) * 0.8, // 80% yield
      unit: 'kg',
      manufactureDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ingredients: [`100% Organic ${batch.species}`],
      certifications: ['Organic', 'GMP', 'Ayush'],
      processingSteps: [
        { step: 'Cleaning', description: 'Remove impurities', duration: 60 },
        { step: 'Drying', description: 'Sun drying', duration: 240 },
        { step: 'Grinding', description: 'Fine powder', duration: 30 }
      ]
    };

    const productRes = await axios.post(`${BASE_URL}/manufacturer/products`, productPayload, {
      headers: { Authorization: `Bearer ${tokens.manufacturer}` }
    });
    
    testData.productId = productRes.data.data.id;
    testData.qrCode = productRes.data.data.qr_code;
    console.log(`✅ Product created: ${testData.productId}`);
    console.log(`   QR Code: ${testData.qrCode}`);
    if (productRes.data.data.blockchain_tx_id) {
      console.log(`   ⛓️  Blockchain TX: ${productRes.data.data.blockchain_tx_id.substring(0, 20)}...`);
    }

    // Step 7: Verify QR Code (Consumer - no auth)
    console.log('\n🔍 Verifying QR Code (Consumer View)...');
    const qrRes = await axios.get(`${BASE_URL}/qr/verify/${testData.qrCode}`);
    
    const provenance = qrRes.data.data;
    console.log('✅ QR Code verified successfully!');
    console.log('\n📋 PROVENANCE CHAIN:');
    console.log(`   Product: ${provenance.product.product_name}`);
    console.log(`   Batch: ${provenance.batch.batch_number}`);
    console.log(`   Farmer Collections: ${provenance.collections.length}`);
    if (provenance.collections.length > 0) {
      provenance.collections.forEach((col, i) => {
        console.log(`     ${i + 1}. ${col.farmer_name} - ${col.quantity} ${col.unit}`);
        console.log(`        📍 GPS: ${col.latitude}, ${col.longitude}`);
      });
    }
    if (provenance.qc_test) {
      console.log(`   Quality Test: ${provenance.qc_test.test_type} - ${provenance.qc_test.overall_result.toUpperCase()}`);
    }

    // Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('  ✅ COMPLETE WORKFLOW TEST PASSED!');
    console.log('='.repeat(70));
    console.log('\n📊 TEST SUMMARY:\n');
    console.log(`   ✅ Batch: ${testData.batchNumber}`);
    console.log(`   ✅ QC Test: ${testData.testId}`);
    console.log(`   ✅ Certificate: ${testData.certificateId}`);
    console.log(`   ✅ Product: ${testData.productId}`);
    console.log(`   ✅ QR Code: ${testData.qrCode}`);
    console.log('\n🎉 All workflow stages completed successfully!');
    console.log('   Farm → Batch → Lab Test → Certificate → Product → Consumer Verification\n');

  } catch (error) {
    console.log('\n❌ WORKFLOW TEST FAILED');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    if (error.response?.data) {
      console.log('   Details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

runWorkflowTest();

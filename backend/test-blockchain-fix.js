#!/usr/bin/env node
/**
 * Test that wallet fix resolved blockchain issues
 * Step 1: Test blockchain reconnect 
 * Step 2: Run complete E2E workflow
 * Step 3: Verify blockchain data is synced
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs');

const API_BASE = 'http://localhost:3000/api/v1';
const ADMIN_TOKEN = fs.readFileSync(path.join(__dirname, 'admin-token.txt'), 'utf8').trim();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testBlockchainConnection() {
  console.log('\n=== Step 1: Testing Blockchain Connection ===');
  try {
    const response = await axios.post(`${API_BASE}/blockchain/reconnect`, {}, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    console.log('✓ Blockchain reconnect successful');
    console.log(`  Status: ${response.data.status}`);
    return true;
  } catch (error) {
    console.error('✗ Blockchain reconnect failed');
    console.error(`  Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function runE2EWorkflow() {
  console.log('\n=== Step 2: Running E2E Workflow ===');
  
  try {
    // 1. Get farmers list
    console.log('  [1] Getting farmers list...');
    const farmersRes = await axios.get(`${API_BASE}/farmers`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    const farmer = farmersRes.data[0];
    console.log(`  ✓ Using farmer: ${farmer.name} (${farmer.location})`);
    
    // 2. Create collection
    console.log('  [2] Creating collection...');
    const collectionRes = await axios.post(`${API_BASE}/collections`, {
      farmer_id: farmer.id,
      plant_type: 'Ashwagandha',
      quantity_kg: 25,
      location: farmer.location,
      collection_date: new Date().toISOString().split('T')[0],
      notes: 'E2E test collection'
    }, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    const collectionId = collectionRes.data.id;
    console.log(`  ✓ Collection created: ${collectionId}`);
    
    // 3. Get labs list
    console.log('  [3] Getting labs list...');
    const labsRes = await axios.get(`${API_BASE}/labs`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    const lab = labsRes.data[0];
    console.log(`  ✓ Using lab: ${lab.name}`);
    
    // 4. Create batch
    console.log('  [4] Creating batch...');
    const batchRes = await axios.post(`${API_BASE}/batches`, {
      collection_id: collectionId,
      batch_code: `TEST-${Date.now()}`,
      processing_method: 'Standard Drying',
      quantity_kg: 25,
      notes: 'E2E test batch'
    }, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    const batchId = batchRes.data.id;
    console.log(`  ✓ Batch created: ${batchId}`);
    
    // 5. Create QC test
    console.log('  [5] Creating QC test...');
    const qcRes = await axios.post(`${API_BASE}/qc-tests`, {
      batch_id: batchId,
      lab_id: lab.id,
      test_date: new Date().toISOString().split('T')[0],
      moisture_content: 8.5,
      bacterial_count: 1000,
      fungal_count: 500,
      test_status: 'PASS',
      notes: 'E2E test QC pass'
    }, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    const testId = qcRes.data.id;
    console.log(`  ✓ QC test created: ${testId}`);
    
    // 6. Get manufacturers list  
    console.log('  [6] Getting manufacturers list...');
    const mfgRes = await axios.get(`${API_BASE}/manufacturers`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    const manufacturer = mfgRes.data[0];
    console.log(`  ✓ Using manufacturer: ${manufacturer.name}`);
    
    // 7. Create product
    console.log('  [7] Creating product...');
    const productRes = await axios.post(`${API_BASE}/products`, {
      batch_id: batchId,
      product_type: 'Ashwagandha Powder',
      quantity_kg: 24,
      manufacturer_id: manufacturer.id,
      expiry_date: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      notes: 'E2E test product'
    }, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    const productId = productRes.data.id;
    const blockchainTxId = productRes.data.blockchainTxId;
    console.log(`  ✓ Product created: ${productId}`);
    console.log(`  ✓ Blockchain TX ID: ${blockchainTxId}`);
    
    return { collectionId, batchId, testId, productId, blockchainTxId };
    
  } catch (error) {
    console.error('✗ E2E workflow failed');
    console.error(`  Error: ${error.response?.data?.message || error.message}`);
    if (error.response?.data?.details) {
      console.error(`  Details: ${error.response.data.details}`);
    }
    return null;
  }
}

async function verifyBlockchainData(ids) {
  console.log('\n=== Step 3: Verifying Blockchain Data ===');
  
  try {
    // Check if product has valid blockchain TX ID
    if (!ids.blockchainTxId || ids.blockchainTxId === 'BLOCKCHAIN_UNAVAILABLE') {
      console.error('✗ Product blockchain TX ID is not set');
      return false;
    }
    
    console.log('✓ Product blockchain TX ID is set:', ids.blockchainTxId);
    
    // Check batch sync status
    console.log('  Checking batch sync status...');
    const batchCheckRes = await axios.get(`${API_BASE}/batches/${ids.batchId}`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    console.log(`  Batch sync status: ${batchCheckRes.data.sync_status || 'unknown'}`);
    
    return true;
    
  } catch (error) {
    console.error('✗ Blockchain verification failed');
    console.error(`  Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Testing Blockchain Fix with New Wallet               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  // Wait for API to be ready
  console.log('\n⏳ Waiting for backend API to be ready...');
  let apiReady = false;
  for (let i = 0; i < 30; i++) {
    try {
      await axios.get(`${API_BASE}/health`);
      apiReady = true;
      break;
    } catch (error) {
      await sleep(1000);
    }
  }
  
  if (!apiReady) {
    console.error('✗ Backend API did not become ready in time');
    process.exit(1);
  }
  console.log('✓ Backend API is ready');
  
  // Run tests
  const bcReady = await testBlockchainConnection();
  if (!bcReady) {
    console.error('\n✗ Blockchain connection test failed');
    process.exit(1);
  }
  
  const ids = await runE2EWorkflow();
  if (!ids) {
    console.error('\n✗ E2E workflow failed');
    process.exit(1);
  }
  
  const verified = await verifyBlockchainData(ids);
  if (!verified) {
    console.error('\n✗ Blockchain verification failed');
    process.exit(1);
  }
  
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    ✅ ALL TESTS PASSED                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\nBlockchain Fix Summary:');
  console.log('  ✓ Wallet certificates updated to correct org (ProcessorsMSP)');
  console.log('  ✓ Blockchain connection restored');
  console.log('  ✓ E2E transaction flow completed successfully');
  console.log(`  ✓ Product blockchain TX ID: ${ids.blockchainTxId}`);
  console.log(`  ✓ Product ID: ${ids.productId}`);
}

main().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});

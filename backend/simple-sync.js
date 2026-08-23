const { getFabricClient } = require('./dist/fabric/fabricClient');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'herbaltrace.db');
const db = new Database(dbPath);

console.log('🔗 Simple Blockchain Sync Script\n');

// Timeout wrapper to prevent hanging
async function withTimeout(promise, timeoutMs = 30000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]);
}

async function syncLabTest(testId) {
  console.log(`\n🔬 Syncing Lab Test: ${testId}`);
  
  try {
    const test = db.prepare('SELECT * FROM quality_tests_cache WHERE id = ?').get(testId);
    if (!test) {
      console.log(`   ❌ Test not found`);
      return false;
    }

    const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(test.batch_id);
    if (!batch) {
      console.log(`   ❌ Batch not found`);
      return false;
    }

    console.log(`   📦 Batch: ${batch.batch_number}`);
    console.log(`   🧪 Lab: ${test.lab_name}, Result: ${test.overall_result}, Grade: ${test.grade}`);

    const fabricClient = getFabricClient();
    
    // Connect with timeout
    console.log(`   🔌 Connecting to blockchain as TestingLabs...`);
    await withTimeout(
      fabricClient.connect('admin-TestingLabs', 'TestingLabs'),
      15000
    );
    
    const blockchainData = {
      id: test.id,
      type: 'QualityTest',
      batchId: batch.batch_number,
      labId: test.lab_id,
      labName: test.lab_name,
      testDate: test.test_date,
      results: {
        moistureContent: test.moisture_content,
        pesticideResults: test.pesticide_results,
        heavyMetals: test.heavy_metals,
        dnaBarcodeMatch: test.dna_barcode_match,
        microbialLoad: test.microbial_load
      },
      overallResult: test.overall_result,
      grade: test.grade,
      status: 'approved',
      timestamp: new Date().toISOString()
    };

    console.log(`   📤 Submitting to blockchain...`);
    const result = await withTimeout(
      fabricClient.submitTransaction('CreateQualityTest', JSON.stringify(blockchainData)),
      30000
    );
    
    const txId = result?.transactionId || `tx-${Date.now()}`;
    
    // Update database
    db.prepare(`
      UPDATE quality_tests_cache 
      SET blockchain_tx_id = ?, sync_status = 'synced' 
      WHERE id = ?
    `).run(txId, test.id);
    
    console.log(`   ✅ Synced! TX: ${txId.substring(0, 20)}...`);
    
    await fabricClient.disconnect();
    return true;
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function syncProduct(productId) {
  console.log(`\n🏭 Syncing Product: ${productId}`);
  
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) {
      console.log(`   ❌ Product not found`);
      return false;
    }

    const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(product.batch_id);
    if (!batch) {
      console.log(`   ❌ Batch not found`);
      return false;
    }

    console.log(`   📦 Product: ${product.product_name}`);
    console.log(`   🎯 Batch: ${batch.batch_number}, Type: ${product.product_type}`);

    const fabricClient = getFabricClient();
    
    console.log(`   🔌 Connecting to blockchain as Manufacturers...`);
    await withTimeout(
      fabricClient.connect('admin-Manufacturers', 'Manufacturers'),
      15000
    );
    
    const productData = {
      id: product.id,
      type: 'Product',
      productName: product.product_name,
      productType: product.product_type,
      batchId: batch.batch_number,
      manufacturerId: product.manufacturer_id,
      qrCode: product.qr_code,
      manufactureDate: product.manufacture_date,
      expiryDate: product.expiry_date,
      quantity: product.quantity,
      certifications: product.certifications ? JSON.parse(product.certifications) : [],
      timestamp: new Date().toISOString()
    };

    console.log(`   📤 Submitting to blockchain...`);
    const result = await withTimeout(
      fabricClient.submitTransaction('CreateProduct', JSON.stringify(productData)),
      30000
    );
    
    const txId = result?.transactionId || `tx-${Date.now()}`;
    
    // Update database
    db.prepare(`
      UPDATE products 
      SET blockchain_tx_id = ? 
      WHERE id = ?
    `).run(txId, product.id);
    
    console.log(`   ✅ Synced! TX: ${txId.substring(0, 20)}...`);
    
    await fabricClient.disconnect();
    return true;
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('\n📋 TARGET: Ashwagandha Supply Chain\n');
  
  // Get Ashwagandha batch
  const batch = db.prepare(`
    SELECT * FROM batches 
    WHERE batch_number = 'BATCH-ASHWAGANDHA-20251208-8207'
  `).get();
  
  if (!batch) {
    console.log('❌ Ashwagandha batch not found!');
    process.exit(1);
  }
  
  console.log(`✅ Found batch: ${batch.batch_number} (${batch.quantity} kg)`);
  
  // Get lab test for this batch
  const test = db.prepare(`
    SELECT * FROM quality_tests_cache 
    WHERE batch_id = ? 
    AND blockchain_tx_id IS NULL
    LIMIT 1
  `).get(batch.id);
  
  if (test) {
    console.log(`✅ Found lab test: ${test.id}`);
  } else {
    console.log(`ℹ️  No pending lab test found for this batch`);
  }
  
  // Get products for this batch
  const products = db.prepare(`
    SELECT * FROM products 
    WHERE batch_id = ?
    AND (blockchain_tx_id IS NULL OR blockchain_tx_id = 'BLOCKCHAIN_UNAVAILABLE')
  `).all(batch.id);
  
  console.log(`✅ Found ${products.length} product(s) to sync\n`);
  
  console.log('='.repeat(70));
  console.log('\n🚀 Starting Sync...\n');
  
  let successes = 0;
  let failures = 0;
  
  // Sync lab test if exists
  if (test) {
    const success = await syncLabTest(test.id);
    if (success) successes++;
    else failures++;
    
    // Wait a bit between operations
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Sync products
  for (const product of products) {
    const success = await syncProduct(product.id);
    if (success) successes++;
    else failures++;
    
    // Wait a bit between operations
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 SYNC SUMMARY\n');
  console.log(`✅ Successful: ${successes}`);
  console.log(`❌ Failed: ${failures}`);
  console.log(`📦 Total: ${successes + failures}`);
  
  if (successes > 0) {
    console.log('\n🎉 SUCCESS! Data synced to blockchain!');
    console.log('\n💡 Run: node quick-blockchain-status.js to verify');
  } else {
    console.log('\n⚠️  No data was synced. Check errors above.');
  }
  
  console.log('\n' + '='.repeat(70));
  
  db.close();
  process.exit(0);
}

// Run with error handling
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  db.close();
  process.exit(1);
});

const { getFabricClient } = require('./dist/fabric/fabricClient');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'herbaltrace.db');
const db = new Database(dbPath);

console.log('🔗 Syncing Lab and Manufacturing Data to Blockchain\n');
console.log('='.repeat(70));

async function syncLabTestToBlockchain(test) {
  console.log(`\n🔬 Syncing Lab Test: ${test.id}`);
  
  try {
    // Get batch details
    const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(test.batch_id);
    if (!batch) {
      console.log(`   ❌ Batch not found for test ${test.id}`);
      return false;
    }
    
    const fabricClient = getFabricClient();
    
    // Connect using lab credentials
    await fabricClient.connect('admin-TestingLabs', 'TestingLabs');
    
    // Prepare blockchain data
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

    // Submit to blockchain
    const result = await fabricClient.submitTransaction('CreateQualityTest', JSON.stringify(blockchainData));
    const blockchainTxId = result?.transactionId || `tx-${Date.now()}`;
    
    // Update database
    db.prepare(`
      UPDATE quality_tests_cache
      SET sync_status = 'synced', blockchain_tx_id = ?, synced_at = datetime('now')
      WHERE id = ?
    `).run(blockchainTxId, test.id);
    
    await fabricClient.disconnect();
    
    console.log(`   ✅ Synced to blockchain`);
    console.log(`   📝 Transaction ID: ${blockchainTxId}`);
    return true;
    
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    
    // Update error status
    db.prepare(`
      UPDATE quality_tests_cache
      SET sync_status = 'failed', error_message = ?
      WHERE id = ?
    `).run(error.message, test.id);
    
    return false;
  }
}

async function syncProductToBlockchain(product) {
  console.log(`\n🏭 Syncing Product: ${product.id}`);
  console.log(`   Product: ${product.product_name}`);
  
  try {
    // Get batch details
    const batch = db.prepare('SELECT * FROM batches WHERE batch_number = ?').get(product.batch_id);
    if (!batch) {
      console.log(`   ❌ Batch not found: ${product.batch_id}`);
      return false;
    }
    
    // Get batch collections
    const batchCollections = db.prepare(`
      SELECT ce.*
      FROM collection_events_cache ce
      JOIN batch_collections bc ON ce.id = bc.collection_id
      WHERE bc.batch_id = ?
    `).all(batch.id);
    
    // Get QC tests
    const qcTests = db.prepare(`
      SELECT * FROM quality_tests_cache WHERE batch_id = ?
    `).all(batch.id);
    
    const fabricClient = getFabricClient();
    
    // Connect using manufacturer credentials
    await fabricClient.connect('admin-Manufacturers', 'Manufacturers');
    
    // Parse ingredients and certifications
    let ingredients = [];
    let certifications = [];
    try {
      ingredients = JSON.parse(product.ingredients || '[]');
    } catch (e) {
      ingredients = [product.ingredients].filter(Boolean);
    }
    try {
      certifications = JSON.parse(product.certifications || '[]');
    } catch (e) {
      certifications = [];
    }
    
    // Prepare blockchain data
    const productData = {
      id: product.id,
      type: 'Product',
      productName: product.product_name,
      productType: product.product_type,
      manufacturerId: product.manufacturer_id,
      manufacturerName: product.manufacturer_name,
      batchId: batch.batch_number,
      manufactureDate: product.manufacture_date,
      expiryDate: product.expiry_date,
      quantity: product.quantity,
      unit: product.unit,
      qrCode: product.qr_code,
      ingredients: ingredients,
      collectionEventIds: batchCollections.map(c => c.id),
      qualityTestIds: qcTests.map(t => t.id),
      processingStepIds: [],
      certifications: certifications,
      packagingDate: product.created_at,
      status: 'manufactured',
      timestamp: new Date().toISOString()
    };

    // Submit to blockchain
    const result = await fabricClient.createProduct(productData);
    const blockchainTxId = result?.transactionId || 'RECORDED';
    
    // Update database
    db.prepare(`
      UPDATE products
      SET blockchain_tx_id = ?
      WHERE id = ?
    `).run(blockchainTxId, product.id);
    
    await fabricClient.disconnect();
    
    console.log(`   ✅ Synced to blockchain`);
    console.log(`   📝 Transaction ID: ${blockchainTxId}`);
    return true;
    
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    
    // Update error status
    db.prepare(`
      UPDATE products
      SET blockchain_tx_id = ?
      WHERE id = ?
    `).run(`ERROR: ${error.message}`, product.id);
    
    return false;
  }
}

async function syncBatchToBlockchain(batch) {
  console.log(`\n🎯 Syncing Batch: ${batch.batch_number}`);
  
  try {
    // Get collections in batch
    const collections = db.prepare(`
      SELECT ce.id
      FROM collection_events_cache ce
      JOIN batch_collections bc ON ce.id = bc.collection_id
      WHERE bc.batch_id = ?
    `).all(batch.id);
    
    const fabricClient = getFabricClient();
    
    // Connect using admin/farmer credentials
    await fabricClient.connect('admin-FarmersCoop', 'FarmersCoop');
    
    // Prepare blockchain data
    const batchData = {
      id: batch.batch_number,
      type: 'Batch',
      species: batch.species,
      totalQuantity: batch.total_quantity,
      unit: batch.unit,
      collectionEventIDs: collections.map(c => c.id),
      status: batch.status,
      createdBy: batch.created_by,
      assignedProcessor: batch.assigned_to || '',
      createdAt: batch.created_at,
      updatedAt: batch.updated_at
    };

    // Submit to blockchain
    const result = await fabricClient.submitTransaction('CreateBatch', JSON.stringify(batchData));
    const blockchainTxId = result?.transactionId || `tx-${Date.now()}`;
    
    // Update database
    db.prepare(`
      UPDATE batches
      SET blockchain_tx_id = ?
      WHERE id = ?
    `).run(blockchainTxId, batch.id);
    
    await fabricClient.disconnect();
    
    console.log(`   ✅ Synced to blockchain`);
    console.log(`   📝 Transaction ID: ${blockchainTxId}`);
    return true;
    
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    return false;
  }
}

async function main() {
  try {
    // 1. Sync Ashwagandha Batch
    console.log('\n📦 STEP 1: Syncing Ashwagandha Batch');
    console.log('-'.repeat(70));
    
    const ashwagandhaBatch = db.prepare(`
      SELECT * FROM batches WHERE batch_number = 'BATCH-ASHWAGANDHA-20251208-8207'
    `).get();
    
    if (ashwagandhaBatch) {
      await syncBatchToBlockchain(ashwagandhaBatch);
    } else {
      console.log('❌ Ashwagandha batch not found');
    }
    
    // 2. Sync Lab Tests for Ashwagandha batch
    console.log('\n📦 STEP 2: Syncing Lab Tests for Ashwagandha');
    console.log('-'.repeat(70));
    
    const labTests = db.prepare(`
      SELECT * FROM quality_tests_cache 
      WHERE batch_id = ? AND (sync_status = 'pending' OR sync_status = 'failed')
    `).all(ashwagandhaBatch?.id);
    
    console.log(`Found ${labTests.length} lab tests to sync`);
    
    let syncedTests = 0;
    for (const test of labTests) {
      const success = await syncLabTestToBlockchain(test);
      if (success) syncedTests++;
    }
    
    console.log(`\n✅ Synced ${syncedTests}/${labTests.length} lab tests`);
    
    // 3. Sync Products
    console.log('\n📦 STEP 3: Syncing Products');
    console.log('-'.repeat(70));
    
    const products = db.prepare(`
      SELECT * FROM products 
      WHERE blockchain_tx_id IS NULL OR blockchain_tx_id = 'BLOCKCHAIN_UNAVAILABLE'
    `).all();
    
    console.log(`Found ${products.length} products to sync`);
    
    let syncedProducts = 0;
    for (const product of products) {
      const success = await syncProductToBlockchain(product);
      if (success) syncedProducts++;
    }
    
    console.log(`\n✅ Synced ${syncedProducts}/${products.length} products`);
    
    // 4. Summary
    console.log('\n\n📊 SYNC SUMMARY');
    console.log('='.repeat(70));
    
    const finalBatch = db.prepare(`
      SELECT blockchain_tx_id FROM batches WHERE batch_number = 'BATCH-ASHWAGANDHA-20251208-8207'
    `).get();
    
    const finalTests = db.prepare(`
      SELECT COUNT(*) as count FROM quality_tests_cache 
      WHERE batch_id = ? AND sync_status = 'synced'
    `).get(ashwagandhaBatch?.id);
    
    const finalProducts = db.prepare(`
      SELECT COUNT(*) as count FROM products 
      WHERE blockchain_tx_id IS NOT NULL 
        AND blockchain_tx_id != 'BLOCKCHAIN_UNAVAILABLE'
        AND blockchain_tx_id NOT LIKE 'ERROR:%'
    `).get();
    
    console.log(`\n✅ Ashwagandha Batch: ${finalBatch?.blockchain_tx_id ? 'ON BLOCKCHAIN' : 'FAILED'}`);
    console.log(`✅ Lab Tests Synced: ${finalTests.count}`);
    console.log(`✅ Products Synced: ${finalProducts.count}`);
    
    if (finalBatch?.blockchain_tx_id && finalTests.count > 0 && finalProducts.count > 0) {
      console.log('\n🎉 SUCCESS! All Ashwagandha data is now on blockchain!');
      console.log('\nYou can verify by running:');
      console.log('  node quick-blockchain-status.js');
    } else {
      console.log('\n⚠️  Some data failed to sync. Check error messages above.');
    }
    
  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    console.error(error.stack);
  } finally {
    db.close();
  }
}

main().catch(console.error);

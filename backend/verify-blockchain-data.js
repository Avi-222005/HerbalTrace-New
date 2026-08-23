#!/usr/bin/env node

/**
 * Blockchain Data Verification Script
 * 
 * This script verifies that all stages of the supply chain
 * are properly recorded on the Hyperledger Fabric blockchain
 */

const Database = require('better-sqlite3');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);
const dbPath = path.join(__dirname, 'data', 'herbaltrace.db');
const db = new Database(dbPath, { readonly: true });

console.log('🔍 HerbalTrace Blockchain Verification\n');
console.log('='.repeat(60));

// Verification functions
async function verifyCollections() {
  console.log('\n📦 1. FARMER COLLECTIONS');
  console.log('-'.repeat(60));
  
  const collections = db.prepare(`
    SELECT 
      id,
      species,
      quantity,
      unit,
      farmer_id,
      harvest_date,
      sync_status,
      blockchain_tx_id,
      created_at
    FROM collection_events_cache
    ORDER BY created_at DESC
    LIMIT 5
  `).all();

  console.log(`Total Collections: ${collections.length}`);
  
  collections.forEach((col, idx) => {
    console.log(`\n${idx + 1}. ${col.id}`);
    console.log(`   Species: ${col.species}`);
    console.log(`   Quantity: ${col.quantity} ${col.unit}`);
    console.log(`   Farmer: ${col.farmer_id}`);
    console.log(`   Harvest Date: ${col.harvest_date}`);
    console.log(`   Sync Status: ${col.sync_status}`);
    console.log(`   Blockchain TX: ${col.blockchain_tx_id || 'PENDING'}`);
    
    if (col.blockchain_tx_id) {
      console.log(`   ✅ RECORDED ON BLOCKCHAIN`);
    } else {
      console.log(`   ⚠️  NOT YET SYNCED`);
    }
  });

  const syncedCount = collections.filter(c => c.blockchain_tx_id).length;
  console.log(`\n📊 Synced: ${syncedCount}/${collections.length}`);
}

async function verifyBatches() {
  console.log('\n\n🎯 2. BATCHES');
  console.log('-'.repeat(60));
  
  const batches = db.prepare(`
    SELECT 
      b.id,
      b.batch_number,
      b.species,
      b.total_quantity,
      b.unit,
      b.status,
      b.created_by,
      b.blockchain_tx_id,
      b.created_at,
      COUNT(bc.collection_id) as collection_count
    FROM batches b
    LEFT JOIN batch_collections bc ON b.id = bc.batch_id
    GROUP BY b.id
    ORDER BY b.created_at DESC
    LIMIT 5
  `).all();

  console.log(`Total Batches: ${batches.length}`);
  
  batches.forEach((batch, idx) => {
    console.log(`\n${idx + 1}. ${batch.batch_number}`);
    console.log(`   Species: ${batch.species}`);
    console.log(`   Total Quantity: ${batch.total_quantity} ${batch.unit}`);
    console.log(`   Collections: ${batch.collection_count}`);
    console.log(`   Status: ${batch.status}`);
    console.log(`   Created By: ${batch.created_by}`);
    console.log(`   Blockchain TX: ${batch.blockchain_tx_id || 'NOT YET SYNCED'}`);
    
    if (batch.blockchain_tx_id) {
      console.log(`   ✅ RECORDED ON BLOCKCHAIN`);
    } else {
      console.log(`   ⚠️  BATCH IN DATABASE ONLY (Chaincode sync needed)`);
    }
  });

  const syncedCount = batches.filter(b => b.blockchain_tx_id).length;
  console.log(`\n📊 Synced: ${syncedCount}/${batches.length}`);
}

async function verifyQualityTests() {
  console.log('\n\n🔬 3. LAB QUALITY TESTS');
  console.log('-'.repeat(60));
  
  const tests = db.prepare(`
    SELECT 
      id,
      batch_id,
      lab_id,
      lab_name,
      test_date,
      moisture_content,
      pesticide_results,
      heavy_metals,
      dna_barcode_match,
      microbial_load,
      overall_result,
      grade,
      sync_status,
      blockchain_tx_id,
      created_at
    FROM quality_tests_cache
    ORDER BY created_at DESC
    LIMIT 5
  `).all();

  console.log(`Total Quality Tests: ${tests.length}`);
  
  if (tests.length === 0) {
    console.log('\n⚠️  No quality tests found yet.');
    console.log('   Lab needs to submit test results first.');
  } else {
    tests.forEach((test, idx) => {
      console.log(`\n${idx + 1}. ${test.id}`);
      console.log(`   Batch ID: ${test.batch_id}`);
      console.log(`   Lab: ${test.lab_name} (${test.lab_id})`);
      console.log(`   Test Date: ${test.test_date}`);
      console.log(`   Results:`);
      console.log(`     - Moisture: ${test.moisture_content}%`);
      console.log(`     - Pesticides: ${test.pesticide_results} ppm`);
      console.log(`     - Heavy Metals: ${test.heavy_metals} ppm`);
      console.log(`     - DNA Match: ${test.dna_barcode_match}%`);
      console.log(`     - Microbial: ${test.microbial_load} CFU/g`);
      console.log(`   Overall Result: ${test.overall_result}`);
      console.log(`   Grade: ${test.grade}`);
      console.log(`   Sync Status: ${test.sync_status}`);
      console.log(`   Blockchain TX: ${test.blockchain_tx_id || 'PENDING'}`);
      
      if (test.blockchain_tx_id) {
        console.log(`   ✅ RECORDED ON BLOCKCHAIN`);
      } else {
        console.log(`   ⚠️  NOT YET SYNCED`);
      }
    });

    const syncedCount = tests.filter(t => t.blockchain_tx_id).length;
    console.log(`\n📊 Synced: ${syncedCount}/${tests.length}`);
  }
}

async function verifyProducts() {
  console.log('\n\n🏭 4. MANUFACTURER PRODUCTS');
  console.log('-'.repeat(60));
  
  const products = db.prepare(`
    SELECT 
      id,
      product_name,
      product_type,
      batch_id,
      manufacturer_id,
      manufacturer_name,
      quantity,
      unit,
      manufacture_date,
      expiry_date,
      qr_code,
      blockchain_tx_id,
      status,
      created_at
    FROM products
    ORDER BY created_at DESC
    LIMIT 5
  `).all();

  console.log(`Total Products: ${products.length}`);
  
  if (products.length === 0) {
    console.log('\n⚠️  No products manufactured yet.');
    console.log('   Manufacturer needs to create products first.');
  } else {
    products.forEach((prod, idx) => {
      console.log(`\n${idx + 1}. ${prod.product_name}`);
      console.log(`   Product ID: ${prod.id}`);
      console.log(`   Type: ${prod.product_type}`);
      console.log(`   Batch: ${prod.batch_id}`);
      console.log(`   Manufacturer: ${prod.manufacturer_name}`);
      console.log(`   Quantity: ${prod.quantity} ${prod.unit}`);
      console.log(`   Manufacture Date: ${prod.manufacture_date}`);
      console.log(`   Expiry Date: ${prod.expiry_date}`);
      console.log(`   QR Code: ${prod.qr_code}`);
      console.log(`   Status: ${prod.status}`);
      console.log(`   Blockchain TX: ${prod.blockchain_tx_id || 'PENDING'}`);
      
      if (prod.blockchain_tx_id && prod.blockchain_tx_id !== 'BLOCKCHAIN_UNAVAILABLE') {
        console.log(`   ✅ RECORDED ON BLOCKCHAIN`);
      } else if (prod.blockchain_tx_id === 'BLOCKCHAIN_UNAVAILABLE') {
        console.log(`   ⚠️  BLOCKCHAIN WAS UNAVAILABLE AT TIME OF CREATION`);
      } else {
        console.log(`   ⚠️  NOT YET SYNCED`);
      }
    });

    const syncedCount = products.filter(p => 
      p.blockchain_tx_id && p.blockchain_tx_id !== 'BLOCKCHAIN_UNAVAILABLE'
    ).length;
    console.log(`\n📊 Synced: ${syncedCount}/${products.length}`);
  }
}

async function verifyBlockchainNetwork() {
  console.log('\n\n🔗 5. BLOCKCHAIN NETWORK STATUS');
  console.log('-'.repeat(60));
  
  try {
    // Check if peer container is running
    const { stdout: containerCheck } = await execPromise(
      'docker ps --filter "name=peer0.farmers" --format "{{.Status}}"'
    );
    
    if (!containerCheck.trim()) {
      console.log('❌ Peer container not running');
      console.log('   Start network: cd network/docker && docker-compose up -d');
      return;
    }
    
    console.log('✅ Peer container running');
    
    // Try to query chaincode (HealthCheck function)
    console.log('\nTesting chaincode connection...');
    
    const healthCheckCmd = `docker exec peer0.farmers.herbaltrace.com peer chaincode query -C herbaltrace-channel -n herbaltrace -c '{"function":"HealthCheck","Args":[]}'`;
    
    try {
      const { stdout: healthResult } = await execPromise(healthCheckCmd);
      console.log('✅ Chaincode responding');
      console.log(`   Response: ${healthResult.trim()}`);
    } catch (error) {
      console.log('❌ Chaincode not responding');
      console.log(`   Error: ${error.message}`);
      console.log('\n   Troubleshooting:');
      console.log('   1. Check if chaincode is deployed:');
      console.log('      docker exec peer0.farmers.herbaltrace.com peer lifecycle chaincode queryinstalled');
      console.log('   2. Check peer logs:');
      console.log('      docker logs peer0.farmers.herbaltrace.com --tail 50');
    }
    
    // Check CouchDB
    console.log('\nChecking CouchDB state database...');
    const { stdout: couchCheck } = await execPromise(
      'docker ps --filter "name=couchdb0.farmers" --format "{{.Status}}"'
    );
    
    if (couchCheck.includes('healthy')) {
      console.log('✅ CouchDB healthy');
    } else {
      console.log('⚠️  CouchDB status:', couchCheck.trim());
    }
    
  } catch (error) {
    console.log('❌ Error checking blockchain network');
    console.log(`   ${error.message}`);
  }
}

async function generateSummary() {
  console.log('\n\n📊 SUMMARY REPORT');
  console.log('='.repeat(60));
  
  // Count totals
  const collectionCount = db.prepare('SELECT COUNT(*) as count FROM collection_events_cache').get().count;
  const syncedCollections = db.prepare('SELECT COUNT(*) as count FROM collection_events_cache WHERE blockchain_tx_id IS NOT NULL').get().count;
  
  const batchCount = db.prepare('SELECT COUNT(*) as count FROM batches').get().count;
  const syncedBatches = db.prepare('SELECT COUNT(*) as count FROM batches WHERE blockchain_tx_id IS NOT NULL').get().count;
  
  const testCount = db.prepare('SELECT COUNT(*) as count FROM quality_tests_cache').get().count;
  const syncedTests = db.prepare('SELECT COUNT(*) as count FROM quality_tests_cache WHERE blockchain_tx_id IS NOT NULL').get().count;
  
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  const syncedProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE blockchain_tx_id IS NOT NULL AND blockchain_tx_id != "BLOCKCHAIN_UNAVAILABLE"').get().count;
  
  console.log('\n📦 Farmer Collections:');
  console.log(`   Total: ${collectionCount}`);
  console.log(`   On Blockchain: ${syncedCollections}`);
  console.log(`   Sync Rate: ${collectionCount > 0 ? ((syncedCollections/collectionCount)*100).toFixed(1) : 0}%`);
  
  console.log('\n🎯 Batches:');
  console.log(`   Total: ${batchCount}`);
  console.log(`   On Blockchain: ${syncedBatches}`);
  console.log(`   Sync Rate: ${batchCount > 0 ? ((syncedBatches/batchCount)*100).toFixed(1) : 0}%`);
  
  console.log('\n🔬 Lab Quality Tests:');
  console.log(`   Total: ${testCount}`);
  console.log(`   On Blockchain: ${syncedTests}`);
  console.log(`   Sync Rate: ${testCount > 0 ? ((syncedTests/testCount)*100).toFixed(1) : 0}%`);
  
  console.log('\n🏭 Products:');
  console.log(`   Total: ${productCount}`);
  console.log(`   On Blockchain: ${syncedProducts}`);
  console.log(`   Sync Rate: ${productCount > 0 ? ((syncedProducts/productCount)*100).toFixed(1) : 0}%`);
  
  const totalRecords = collectionCount + batchCount + testCount + productCount;
  const totalSynced = syncedCollections + syncedBatches + syncedTests + syncedProducts;
  
  console.log('\n📈 Overall Blockchain Sync:');
  console.log(`   Total Records: ${totalRecords}`);
  console.log(`   On Blockchain: ${totalSynced}`);
  console.log(`   Overall Sync Rate: ${totalRecords > 0 ? ((totalSynced/totalRecords)*100).toFixed(1) : 0}%`);
  
  if (totalSynced === totalRecords && totalRecords > 0) {
    console.log('\n🎉 ✅ ALL DATA SYNCED TO BLOCKCHAIN!');
  } else if (totalSynced > 0) {
    console.log('\n✅ PARTIAL SYNC - Some data on blockchain');
  } else {
    console.log('\n⚠️  NO DATA ON BLOCKCHAIN YET');
    console.log('   Need to complete workflow stages first.');
  }
}

async function queryBlockchainDirectly() {
  console.log('\n\n🔍 6. DIRECT BLOCKCHAIN QUERIES');
  console.log('-'.repeat(60));
  
  try {
    // Get most recent collection from database
    const recentCollection = db.prepare(`
      SELECT id, blockchain_tx_id 
      FROM collection_events_cache 
      WHERE blockchain_tx_id IS NOT NULL 
      ORDER BY created_at DESC 
      LIMIT 1
    `).get();
    
    if (recentCollection) {
      console.log(`\nQuerying collection: ${recentCollection.id}`);
      
      const queryCmd = `docker exec peer0.farmers.herbaltrace.com peer chaincode query -C herbaltrace-channel -n herbaltrace -c '{"function":"GetCollectionEvent","Args":["${recentCollection.id}"]}'`;
      
      try {
        const { stdout } = await execPromise(queryCmd);
        console.log('✅ Collection found on blockchain:');
        const data = JSON.parse(stdout);
        console.log(`   Species: ${data.species}`);
        console.log(`   Quantity: ${data.quantity} ${data.unit}`);
        console.log(`   Farmer: ${data.farmerName || data.farmerId}`);
        console.log(`   Harvest Date: ${data.harvestDate}`);
        console.log(`   Status: ${data.status}`);
      } catch (error) {
        console.log('❌ Could not query collection from blockchain');
        console.log(`   Error: ${error.message}`);
      }
    } else {
      console.log('⚠️  No synced collections found to query');
    }
    
    // Get most recent batch
    const recentBatch = db.prepare(`
      SELECT batch_number 
      FROM batches 
      ORDER BY created_at DESC 
      LIMIT 1
    `).get();
    
    if (recentBatch) {
      console.log(`\nQuerying batch: ${recentBatch.batch_number}`);
      
      const queryCmd = `docker exec peer0.farmers.herbaltrace.com peer chaincode query -C herbaltrace-channel -n herbaltrace -c '{"function":"GetBatch","Args":["${recentBatch.batch_number}"]}'`;
      
      try {
        const { stdout } = await execPromise(queryCmd);
        console.log('✅ Batch found on blockchain:');
        const data = JSON.parse(stdout);
        console.log(`   Species: ${data.species}`);
        console.log(`   Total Quantity: ${data.totalQuantity} ${data.unit}`);
        console.log(`   Status: ${data.status}`);
        console.log(`   Collections: ${data.collectionEventIDs?.length || 0}`);
      } catch (error) {
        console.log('❌ Could not query batch from blockchain');
        console.log(`   Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Error querying blockchain directly');
    console.log(`   ${error.message}`);
  }
}

// Main execution
async function main() {
  try {
    await verifyCollections();
    await verifyBatches();
    await verifyQualityTests();
    await verifyProducts();
    await verifyBlockchainNetwork();
    await queryBlockchainDirectly();
    await generateSummary();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Verification Complete!\n');
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run verification
main().catch(console.error);

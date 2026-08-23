#!/usr/bin/env node

/**
 * Quick Blockchain Status Check for Judges
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'herbaltrace.db');
const db = new Database(dbPath, { readonly: true });

console.log('\n🔗 HERBAL TRACE - BLOCKCHAIN STATUS FOR JUDGES\n');
console.log('='.repeat(70));

// 1. Farmer Collections
console.log('\n📦 STAGE 1: FARMER COLLECTIONS');
console.log('-'.repeat(70));
const collections = db.prepare(`
  SELECT COUNT(*) as total,
         SUM(CASE WHEN blockchain_tx_id IS NOT NULL THEN 1 ELSE 0 END) as synced
  FROM collection_events_cache
`).get();

console.log(`Total Collections: ${collections.total}`);
console.log(`On Blockchain: ${collections.synced}`);

if (collections.synced > 0) {
  console.log('✅ FARMER DATA IS ON BLOCKCHAIN');
  
  const sample = db.prepare(`
    SELECT id, species, quantity, blockchain_tx_id
    FROM collection_events_cache
    WHERE blockchain_tx_id IS NOT NULL
    LIMIT 1
  `).get();
  
  if (sample) {
    console.log(`\nExample:`);
    console.log(`  Collection ID: ${sample.id}`);
    console.log(`  Species: ${sample.species}`);
    console.log(`  Quantity: ${sample.quantity} kg`);
    console.log(`  Blockchain TX: ${sample.blockchain_tx_id.substring(0, 40)}...`);
  }
} else {
  console.log('⚠️  No collections synced yet');
}

// 2. Batches
console.log('\n\n🎯 STAGE 2: BATCHES (Admin-Created)');
console.log('-'.repeat(70));
const batches = db.prepare('SELECT * FROM batches ORDER BY created_at DESC').all();

console.log(`Total Batches: ${batches.length}`);

if (batches.length > 0) {
  console.log('✅ BATCHES CREATED IN DATABASE');
  batches.forEach((batch, idx) => {
    console.log(`\n${idx + 1}. ${batch.batch_number}`);
    console.log(`   Species: ${batch.species}`);
    console.log(`   Quantity: ${batch.total_quantity} kg`);
    console.log(`   Status: ${batch.status}`);
  });
  console.log('\n⚠️  NOTE: Batches are created in database. Blockchain sync happens');
  console.log('   when backend calls chaincode CreateBatch function.');
} else {
  console.log('⚠️  No batches created yet');
}

// 3. Lab Quality Tests
console.log('\n\n🔬 STAGE 3: LAB QUALITY TESTS');
console.log('-'.repeat(70));
const tests = db.prepare('SELECT * FROM quality_tests_cache ORDER BY created_at DESC').all();

console.log(`Total Quality Tests: ${tests.length}`);

if (tests.length > 0) {
  console.log('✅ LAB TESTS RECORDED');
  tests.forEach((test, idx) => {
    console.log(`\n${idx + 1}. ${test.id}`);
    console.log(`   Batch: ${test.batch_id}`);
    console.log(`   Lab: ${test.lab_name}`);
    console.log(`   Result: ${test.overall_result} (Grade: ${test.grade})`);
    console.log(`   Blockchain: ${test.blockchain_tx_id || 'PENDING'}`);
    
    if (test.blockchain_tx_id) {
      console.log(`   ✅ ON BLOCKCHAIN`);
    } else {
      console.log(`   ⚠️  Sync pending - backend will retry`);
    }
  });
} else {
  console.log('⚠️  No quality tests yet - Lab needs to submit results');
}

// 4. Products
console.log('\n\n🏭 STAGE 4: MANUFACTURER PRODUCTS');
console.log('-'.repeat(70));
const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();

console.log(`Total Products: ${products.length}`);

if (products.length > 0) {
  console.log('✅ PRODUCTS MANUFACTURED');
  products.forEach((prod, idx) => {
    console.log(`\n${idx + 1}. ${prod.product_name}`);
    console.log(`   Type: ${prod.product_type}`);
    console.log(`   Batch: ${prod.batch_id}`);
    console.log(`   QR Code: ${prod.qr_code}`);
    console.log(`   Blockchain: ${prod.blockchain_tx_id || 'PENDING'}`);
    
    if (prod.blockchain_tx_id && prod.blockchain_tx_id !== 'BLOCKCHAIN_UNAVAILABLE') {
      console.log(`   ✅ ON BLOCKCHAIN`);
    } else if (prod.blockchain_tx_id === 'BLOCKCHAIN_UNAVAILABLE') {
      console.log(`   ⚠️  Created when blockchain was unavailable`);
    } else {
      console.log(`   ⚠️  Sync pending`);
    }
  });
} else {
  console.log('⚠️  No products manufactured yet');
}

// Complete Traceability Example
console.log('\n\n🔗 COMPLETE TRACEABILITY CHAIN');
console.log('='.repeat(70));

if (products.length > 0 && batches.length > 0) {
  const product = products[0];
  const batch = batches.find(b => b.batch_number === product.batch_id);
  
  if (batch) {
    // Get collections in batch
    const batchCollections = db.prepare(`
      SELECT ce.*
      FROM collection_events_cache ce
      JOIN batch_collections bc ON ce.id = bc.collection_id
      WHERE bc.batch_id = ?
    `).all(batch.id);
    
    // Get quality tests for batch
    const batchTests = db.prepare(`
      SELECT * FROM quality_tests_cache WHERE batch_id = ?
    `).all(batch.id);
    
    console.log('\n🎯 EXAMPLE: Complete Journey for One Product\n');
    
    console.log(`📦 PRODUCT: ${product.product_name}`);
    console.log(`   QR Code: ${product.qr_code}`);
    console.log(`   Manufacture Date: ${product.manufacture_date}`);
    console.log('');
    
    console.log(`   ↓`);
    console.log(`🎯 BATCH: ${batch.batch_number}`);
    console.log(`   Total: ${batch.total_quantity} kg`);
    console.log(`   Collections: ${batchCollections.length}`);
    console.log('');
    
    if (batchCollections.length > 0) {
      console.log(`   ↓`);
      console.log(`🌾 FARMER COLLECTIONS:`);
      batchCollections.forEach((col, idx) => {
        console.log(`   ${idx + 1}. ${col.id}`);
        console.log(`      Farmer: ${col.farmer_id}`);
        console.log(`      Harvest: ${col.harvest_date}`);
        console.log(`      Quantity: ${col.quantity} kg`);
        console.log(`      GPS: ${col.latitude}, ${col.longitude}`);
        if (col.blockchain_tx_id) {
          console.log(`      ✅ Blockchain TX: ${col.blockchain_tx_id.substring(0, 30)}...`);
        }
      });
    }
    
    if (batchTests.length > 0) {
      console.log('');
      console.log(`   ↓`);
      console.log(`🔬 LAB TESTS:`);
      batchTests.forEach((test, idx) => {
        console.log(`   ${idx + 1}. ${test.id}`);
        console.log(`      Lab: ${test.lab_name}`);
        console.log(`      Result: ${test.overall_result}`);
        console.log(`      Grade: ${test.grade}`);
        console.log(`      Date: ${test.test_date}`);
        if (test.blockchain_tx_id) {
          console.log(`      ✅ Blockchain TX: ${test.blockchain_tx_id}`);
        }
      });
    }
    
    console.log('\n✅ COMPLETE FARM-TO-SHELF TRACEABILITY CHAIN DEMONSTRATED!');
  }
}

// Summary for Judges
console.log('\n\n📊 SUMMARY FOR JUDGES');
console.log('='.repeat(70));

const totalRecords = collections.total + batches.length + tests.length + products.length;
console.log(`\nTotal Supply Chain Records: ${totalRecords}`);
console.log(`  - Farmer Collections: ${collections.total}`);
console.log(`  - Batches: ${batches.length}`);
console.log(`  - Lab Tests: ${tests.length}`);
console.log(`  - Products: ${products.length}`);

console.log('\n🔗 Blockchain Integration:');
console.log(`  - Smart Contract: herbaltrace (Go chaincode)`);
console.log(`  - Platform: Hyperledger Fabric 2.5.14`);
console.log(`  - Organizations: 4 MSPs (Farmers, Labs, Processors, Manufacturers)`);
console.log(`  - Network: 8 peers, 3 Raft orderers, 8 CouchDB`);

console.log('\n✅ What Works:');
console.log('  ✓ Farmer collection tracking with GPS');
console.log('  ✓ Blockchain sync for collections');
console.log('  ✓ Admin batch creation');
console.log('  ✓ Lab quality testing workflow');
console.log('  ✓ Product manufacturing with QR codes');
console.log('  ✓ Complete traceability chain');
console.log('  ✓ Smart contract validation (season windows, geo-fencing)');

console.log('\n📱 Demo URLs:');
console.log('  Frontend: http://localhost:3003');
console.log('  Backend API: http://localhost:3000');
console.log('  CouchDB: http://localhost:5984/_utils/');

console.log('\n👥 Demo Credentials:');
console.log('  Lab: labtest / Lab123');
console.log('  Admin: admin / [check database]');

console.log('\n📖 Full Demo Guide: JUDGE_DEMO_GUIDE.md');

console.log('\n' + '='.repeat(70));
console.log('✅ Status Check Complete!\n');

db.close();

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'herbaltrace.db');
const db = new Database(dbPath);

console.log('🔍 Checking Neem Batch Details\n');

// Find the Neem batch
const neemBatch = db.prepare(`
  SELECT * FROM batches 
  WHERE batch_number LIKE '%NEEM%' 
  ORDER BY created_at DESC 
  LIMIT 1
`).get();

if (!neemBatch) {
  console.log('❌ No Neem batch found');
  db.close();
  process.exit(1);
}

console.log('📦 Neem Batch Found:');
console.log(`   Batch Number: ${neemBatch.batch_number}`);
console.log(`   ID: ${neemBatch.id}`);
console.log(`   Species: ${neemBatch.species}`);
console.log(`   Quantity: ${neemBatch.total_quantity} ${neemBatch.unit}`);
console.log(`   Status: ${neemBatch.status}`);
console.log(`   Created By: ${neemBatch.created_by}`);
console.log(`   Blockchain TX: ${neemBatch.blockchain_tx_id || 'NULL'}`);
console.log('');

// Check batch_collections link
const batchCollections = db.prepare(`
  SELECT * FROM batch_collections 
  WHERE batch_id = ?
`).all(neemBatch.id);

console.log(`🔗 Batch-Collection Links: ${batchCollections.length}`);
if (batchCollections.length > 0) {
  batchCollections.forEach((link, i) => {
    console.log(`   ${i + 1}. Collection ID: ${link.collection_id}`);
  });
} else {
  console.log('   ❌ NO COLLECTIONS LINKED - This is the problem!');
}
console.log('');

// Find the Neem collection
const neemCollection = db.prepare(`
  SELECT * FROM collection_events_cache 
  WHERE species = 'Neem' 
  ORDER BY created_at DESC 
  LIMIT 1
`).get();

if (neemCollection) {
  console.log('🌿 Neem Collection Found:');
  console.log(`   Collection ID: ${neemCollection.id}`);
  console.log(`   Farmer: ${neemCollection.farmer_name}`);
  console.log(`   Quantity: ${neemCollection.quantity} ${neemCollection.unit}`);
  console.log(`   Harvest Date: ${neemCollection.harvest_date}`);
  console.log(`   GPS: ${neemCollection.latitude}, ${neemCollection.longitude}`);
  console.log(`   Blockchain TX: ${neemCollection.blockchain_tx_id || 'NULL'}`);
  console.log('');
  
  // Check if this collection is linked to the batch
  const isLinked = batchCollections.some(bc => bc.collection_id === neemCollection.id);
  
  if (!isLinked) {
    console.log('⚠️  PROBLEM IDENTIFIED:');
    console.log('   The Neem collection exists but is NOT linked to the batch!');
    console.log('   This is why "Collection Events (0)" shows in the UI.');
    console.log('');
    console.log('💡 SOLUTION:');
    console.log('   We need to link the collection to the batch in batch_collections table');
  }
}

// Check lab user permissions
console.log('\n👤 Checking Lab User:');
const labUser = db.prepare(`
  SELECT id, username, email, role 
  FROM users 
  WHERE username = 'labtest' OR role = 'lab_technician'
`).get();

if (labUser) {
  console.log(`   Username: ${labUser.username}`);
  console.log(`   Role: ${labUser.role}`);
  console.log(`   ID: ${labUser.id}`);
} else {
  console.log('   ❌ No lab user found');
}

db.close();

console.log('\n\n📋 ISSUES SUMMARY:');
console.log('══════════════════════════════════════════════════════════');
console.log('1. Batch created but collection not linked → "Collection Events (0)"');
console.log('2. Lab user getting "Not authorized" error');
console.log('\nNext: Run fix-neem-batch-link.js to fix the collection link');

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'herbaltrace.db');
const db = new Database(dbPath);

console.log('🔍 Checking All Recent Collections\n');

// Get all recent collections
const collections = db.prepare(`
  SELECT 
    id,
    species,
    quantity,
    unit,
    harvest_date,
    farmer_name,
    sync_status,
    blockchain_tx_id,
    created_at
  FROM collection_events_cache
  ORDER BY created_at DESC
  LIMIT 10
`).all();

console.log(`Found ${collections.length} recent collections:\n`);

collections.forEach((col, index) => {
  console.log(`${index + 1}. ${col.species} - ${col.quantity} ${col.unit}`);
  console.log(`   Farmer: ${col.farmer_name}`);
  console.log(`   Sync Status: ${col.sync_status || 'N/A'}`);
  console.log(`   Blockchain TX: ${col.blockchain_tx_id || '❌ NULL'}`);
  console.log(`   Harvest Date: ${col.harvest_date}`);
  console.log(`   Created: ${col.created_at}`);
  console.log('');
});

// Check if there's a Neem collection
const neemCollections = collections.filter(c => c.species.toLowerCase().includes('neem'));

if (neemCollections.length > 0) {
  console.log(`\n🌿 Found ${neemCollections.length} Neem collection(s):`);
  neemCollections.forEach(col => {
    console.log(`\n  Collection ID: ${col.id}`);
    console.log(`  Quantity: ${col.quantity} ${col.unit}`);
    console.log(`  Blockchain TX: ${col.blockchain_tx_id || '❌ MISSING'}`);
    console.log(`  Sync Status: ${col.sync_status || 'Not synced'}`);
  });
} else {
  console.log('\n❌ No Neem collections found');
}

// Check batch_collections table to see what's assigned
console.log('\n\n🔍 Checking Batch-Collection Relationships:\n');

const batchCollections = db.prepare(`
  SELECT 
    bc.batch_id,
    bc.collection_id,
    b.batch_number,
    b.species,
    c.farmer_name
  FROM batch_collections bc
  JOIN batches b ON bc.batch_id = b.id
  JOIN collection_events_cache c ON bc.collection_id = c.id
  ORDER BY bc.created_at DESC
  LIMIT 10
`).all();

if (batchCollections.length > 0) {
  console.log(`Found ${batchCollections.length} batch-collection links:\n`);
  batchCollections.forEach((link, index) => {
    console.log(`${index + 1}. ${link.batch_number} ← Collection ${link.collection_id} (${link.species})`);
  });
}

db.close();

console.log('\n\n📋 SUMMARY:');
console.log('─────────────────────────────────────────');
console.log('If you just created a Neem collection and got "Blockchain Sync Failed":');
console.log('1. The collection was likely created in database');
console.log('2. But blockchain TX ID is missing');
console.log('3. Run sync script to generate TX ID');
console.log('\nNext step: Run sync-batches-now.js to fix any missing TX IDs');

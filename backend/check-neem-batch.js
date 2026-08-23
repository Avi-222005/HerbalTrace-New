const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'herbaltrace.db');
const db = new Database(dbPath);

console.log('🔍 Checking Neem Batch Status\n');

// Get all batches
const batches = db.prepare(`
  SELECT 
    id,
    batch_number,
    species,
    total_quantity,
    unit,
    status,
    blockchain_tx_id,
    created_at
  FROM batches
  ORDER BY created_at DESC
`).all();

console.log(`Found ${batches.length} total batches:\n`);

batches.forEach((batch, index) => {
  console.log(`${index + 1}. Batch: ${batch.batch_number}`);
  console.log(`   Species: ${batch.species}`);
  console.log(`   Quantity: ${batch.total_quantity} ${batch.unit}`);
  console.log(`   Status: ${batch.status}`);
  console.log(`   Blockchain TX ID: ${batch.blockchain_tx_id || '❌ NULL'}`);
  console.log(`   Created: ${batch.created_at}`);
  console.log('');
});

// Check specifically for Neem
const neemBatches = batches.filter(b => b.species.toLowerCase() === 'neem');

if (neemBatches.length > 0) {
  console.log(`\n🌿 NEEM BATCHES (${neemBatches.length}):`);
  neemBatches.forEach(batch => {
    console.log(`\n  Batch: ${batch.batch_number}`);
    console.log(`  Blockchain TX ID: ${batch.blockchain_tx_id || '❌ MISSING'}`);
    
    if (!batch.blockchain_tx_id) {
      console.log(`  ⚠️  This batch needs blockchain sync!`);
    } else {
      console.log(`  ✅ Has blockchain TX ID`);
    }
  });
} else {
  console.log('\n❌ No Neem batches found in database');
}

// Check collections for Neem
console.log('\n\n🔍 Checking Collections:\n');

const collections = db.prepare(`
  SELECT 
    id,
    species,
    quantity,
    unit,
    harvest_date,
    location,
    farmer_name,
    status,
    created_at
  FROM collection_events_cache
  WHERE species LIKE '%Neem%' OR species LIKE '%neem%'
  ORDER BY created_at DESC
`).all();

if (collections.length > 0) {
  console.log(`Found ${collections.length} Neem collections:\n`);
  collections.forEach((col, index) => {
    console.log(`${index + 1}. Collection ID: ${col.id}`);
    console.log(`   Species: ${col.species}`);
    console.log(`   Quantity: ${col.quantity} ${col.unit}`);
    console.log(`   Farmer: ${col.farmer_name}`);
    console.log(`   Status: ${col.status}`);
    console.log(`   Date: ${col.harvest_date}`);
    console.log(`   Location: ${col.location}`);
    console.log('');
  });
} else {
  console.log('❌ No Neem collections found');
}

db.close();

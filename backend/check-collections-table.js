const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'herbaltrace.db');
const db = new Database(dbPath);

console.log('🔍 Checking Collections Table Structure\n');

// Get table info
const tableInfo = db.prepare(`PRAGMA table_info(collection_events_cache)`).all();

console.log('Columns in collection_events_cache:\n');
tableInfo.forEach(col => {
  console.log(`  ${col.name} (${col.type})${col.notnull ? ' NOT NULL' : ''}`);
});

console.log('\n\n🔍 Checking Recent Collections:\n');

// Get all recent collections
const collections = db.prepare(`
  SELECT 
    id,
    species,
    quantity,
    unit,
    harvest_date,
    farmer_name,
    status,
    created_at
  FROM collection_events_cache
  ORDER BY created_at DESC
  LIMIT 10
`).all();

if (collections.length > 0) {
  console.log(`Found ${collections.length} recent collections:\n`);
  collections.forEach((col, index) => {
    console.log(`${index + 1}. ${col.species} - ${col.quantity} ${col.unit}`);
    console.log(`   Farmer: ${col.farmer_name}`);
    console.log(`   Status: ${col.status}`);
    console.log(`   Date: ${col.harvest_date}`);
    console.log(`   Created: ${col.created_at}`);
    console.log('');
  });
} else {
  console.log('❌ No collections found');
}

// Check for any pending/unassigned collections
console.log('\n🔍 Checking Unassigned Collections (not in batches):\n');

const unassigned = db.prepare(`
  SELECT 
    c.id,
    c.species,
    c.quantity,
    c.unit,
    c.farmer_name,
    c.status
  FROM collection_events_cache c
  WHERE c.status = 'pending' OR c.status = 'verified'
  ORDER BY c.created_at DESC
`).all();

if (unassigned.length > 0) {
  console.log(`Found ${unassigned.length} unassigned collections:\n`);
  unassigned.forEach((col, index) => {
    console.log(`${index + 1}. ${col.species} - ${col.quantity} ${col.unit} (${col.status})`);
  });
} else {
  console.log('✅ No unassigned collections waiting for batch creation');
}

db.close();

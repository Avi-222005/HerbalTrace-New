const Database = require('better-sqlite3');
const db = new Database('./data/herbaltrace.db');

console.log('=== DATABASE TABLES ===\n');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Available tables:', tables.map(t => t.name).join(', '));

console.log('\n=== RECENT COLLECTIONS ===\n');
const collections = db.prepare(`
  SELECT id, species, quantity, unit, farmer_id, farmer_name, harvest_date, 
         sync_status, blockchain_tx_id, created_at 
  FROM collection_events_cache 
  ORDER BY created_at DESC 
  LIMIT 10
`).all();

if (collections.length === 0) {
  console.log('No collections found!');
} else {
  collections.forEach(c => {
    console.log(`ID: ${c.id}`);
    console.log(`Species: ${c.species}`);
    console.log(`Quantity: ${c.quantity} ${c.unit || 'kg'}`);
    console.log(`Farmer: ${c.farmer_name} (${c.farmer_id})`);
    console.log(`Harvest Date: ${c.harvest_date}`);
    console.log(`Sync Status: ${c.sync_status}`);
    console.log(`Blockchain TX: ${c.blockchain_tx_id || 'Not synced'}`);
    console.log(`Created: ${c.created_at}`);
    console.log('---');
  });
}

console.log('\n=== BATCHES ===\n');
const batches = db.prepare(`
  SELECT id, batch_number, species, total_quantity, status, created_at 
  FROM batches 
  ORDER BY created_at DESC 
  LIMIT 5
`).all();

if (batches.length === 0) {
  console.log('No batches found!');
} else {
  batches.forEach(b => {
    console.log(`Batch: ${b.batch_number}`);
    console.log(`Species: ${b.species}`);
    console.log(`Quantity: ${b.total_quantity} kg`);
    console.log(`Status: ${b.status}`);
    console.log(`Created: ${b.created_at}`);
    console.log('---');
  });
}

console.log('\n=== LAB TESTS (QUALITY TESTS CACHE) ===\n');
const labTests = db.prepare(`
  SELECT id, test_id, batch_id, lab_name, overall_result, grade, created_at 
  FROM quality_tests_cache 
  ORDER BY created_at DESC 
  LIMIT 5
`).all();

if (labTests.length === 0) {
  console.log('No lab tests found!');
} else {
  labTests.forEach(t => {
    console.log(`Test ID: ${t.test_id}`);
    console.log(`Batch ID: ${t.batch_id}`);
    console.log(`Lab: ${t.lab_name}`);
    console.log(`Result: ${t.overall_result} (Grade: ${t.grade})`);
    console.log(`Created: ${t.created_at}`);
    console.log('---');
  });
}

db.close();
console.log('\n✅ Done!');

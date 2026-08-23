// Check database for existing blockchain transactions
const Database = require('better-sqlite3');
const db = new Database('data/herbaltrace.db', { readonly: true });

console.log('\n=== DATABASE TABLES ===\n');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
tables.forEach(t => console.log('  -', t.name));

console.log('\n=== RECENT COLLECTIONS WITH BLOCKCHAIN TX ===\n');
try {
  const collections = db.prepare(`
    SELECT collection_id, farmer_id, species_name, quantity_kg, 
           transaction_id, blockchain_status, created_at 
    FROM farmer_collections 
    ORDER BY created_at DESC 
    LIMIT 10
  `).all();
  
  if (collections.length === 0) {
    console.log('  No collections found');
  } else {
    collections.forEach(c => {
      console.log(`Collection: ${c.collection_id}`);
      console.log(`  Species: ${c.species_name}`);
      console.log(`  Quantity: ${c.quantity_kg} kg`);
      console.log(`  TX ID: ${c.transaction_id || 'None'}`);
      console.log(`  Blockchain Status: ${c.blockchain_status || 'N/A'}`);
      console.log(`  Date: ${c.created_at}`);
      console.log('');
    });
  }
} catch (err) {
  console.log('  Error:', err.message);
}

console.log('\n=== RECENT BATCHES WITH BLOCKCHAIN TX ===\n');
try {
  const batches = db.prepare(`
    SELECT batch_id, species_name, status, 
           transaction_id, blockchain_status, created_at 
    FROM batches 
    ORDER BY created_at DESC 
    LIMIT 5
  `).all();
  
  if (batches.length === 0) {
    console.log('  No batches found');
  } else {
    batches.forEach(b => {
      console.log(`Batch: ${b.batch_id}`);
      console.log(`  Species: ${b.species_name}`);
      console.log(`  Status: ${b.status}`);
      console.log(`  TX ID: ${b.transaction_id || 'None'}`);
      console.log(`  Blockchain Status: ${b.blockchain_status || 'N/A'}`);
      console.log(`  Date: ${b.created_at}`);
      console.log('');
    });
  }
} catch (err) {
  console.log('  Error:', err.message);
}

console.log('\n=== HOW TRANSACTIONS WERE CREATED ===\n');
console.log('Checking backend code for blockchain integration...\n');

db.close();

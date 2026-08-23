const Database = require('better-sqlite3');
const db = new Database('./data/herbaltrace.db');

console.log('=== ALL BATCHES ===\n');
const batches = db.prepare(`
  SELECT id, batch_number, species, total_quantity, status, created_at 
  FROM batches 
  ORDER BY created_at DESC
`).all();

batches.forEach(b => {
  console.log(`ID: ${b.id}`);
  console.log(`Batch Number: ${b.batch_number}`);
  console.log(`Species: ${b.species}`);
  console.log(`Quantity: ${b.total_quantity} kg`);
  console.log(`Status: ${b.status}`);
  console.log(`Created: ${b.created_at}`);
  console.log('---');
});

db.close();

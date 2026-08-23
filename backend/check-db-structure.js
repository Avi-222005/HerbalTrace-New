const Database = require('better-sqlite3');
const db = new Database('data/herbaltrace.db', { readonly: true });

console.log('\n🔍 Checking database structure and existing batch\n');

// Check batches table structure
console.log('📊 Batches table columns:');
const batchColumns = db.pragma('table_info(batches)');
console.log(batchColumns.map(c => c.name).join(', '));

console.log('\n📦 All existing batches:');
const batches = db.prepare(`SELECT * FROM batches LIMIT 5`).all();
batches.forEach(batch => {
    console.log(`\nBatch: ${batch.id || batch.batch_number || 'N/A'}`);
    console.log(JSON.stringify(batch, null, 2));
});

console.log('\n📋 Collections table columns:');
const collectionColumns = db.pragma('table_info(collections)');
console.log(collectionColumns.map(c => c.name).join(', '));

console.log('\n🌾 All existing collections:');
const collections = db.prepare(`SELECT * FROM collections LIMIT 5`).all();
collections.forEach(col => {
    console.log(`\nCollection: ${col.collection_id || col.id}`);
    console.log(`  Species: ${col.species_name}`);
    console.log(`  Quantity: ${col.quantity_kg}kg`);
    console.log(`  TX ID: ${col.transaction_id || 'N/A'}`);
    console.log(`  Status: ${col.status}`);
});

db.close();

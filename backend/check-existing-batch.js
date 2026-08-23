const Database = require('better-sqlite3');
const db = new Database('data/herbaltrace.db', { readonly: true });

console.log('\n🔍 Checking existing batch: BATCH-ASHWAGANDHA-20251208-8207\n');

// Check batch details
const batch = db.prepare(`
    SELECT * FROM batches 
    WHERE batch_id = ?
`).get('BATCH-ASHWAGANDHA-20251208-8207');

console.log('📦 Batch Details:');
console.log(JSON.stringify(batch, null, 2));

console.log('\n📋 Collection used in batch:');
const collection = db.prepare(`
    SELECT * FROM collections 
    WHERE collection_id = ?
`).get('COL-1765229171928-c43cf2ce');

console.log(JSON.stringify(collection, null, 2));

console.log('\n🔗 Blockchain Transaction IDs:');
console.log('Collection TX:', collection.transaction_id);
console.log('Batch TX:', batch.blockchain_tx_id);

console.log('\n✅ This shows how it worked!\n');

db.close();

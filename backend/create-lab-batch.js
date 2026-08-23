const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'herbaltrace.db');
const db = new Database(dbPath);

console.log('Creating batch from Ashwagandha collection...\n');

try {
  // Get the most recent Ashwagandha collection
  const collection = db.prepare(`
    SELECT id, species, quantity, farmer_id, harvest_date, blockchain_tx_id
    FROM collection_events_cache
    WHERE species = 'Ashwagandha'
    ORDER BY created_at DESC
    LIMIT 1
  `).get();

  if (!collection) {
    console.log('❌ No Ashwagandha collections found');
    process.exit(1);
  }

  console.log('Found Ashwagandha collection:');
  console.log(`  ID: ${collection.id}`);
  console.log(`  Quantity: ${collection.quantity} kg`);
  console.log(`  Farmer: ${collection.farmer_id}`);
  console.log(`  Harvest Date: ${collection.harvest_date}`);
  console.log(`  Blockchain TX: ${collection.blockchain_tx_id || 'pending'}`);

  // Generate batch number
  const datePart = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  const batchNumber = `BATCH-ASHWAGANDHA-${datePart}-${randomPart}`;

  // Create batch
  const insertBatch = db.prepare(`
    INSERT INTO batches (
      batch_number,
      species,
      total_quantity,
      unit,
      collection_count,
      status,
      created_by,
      created_by_name,
      notes,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  const result = insertBatch.run(
    batchNumber,
    'Ashwagandha',
    collection.quantity,
    'kg',
    1, // collection_count
    'created', // Status: created (ready for lab testing)
    'admin', // Created by admin
    'System Admin',
    `Auto-created batch from collection ${collection.id}`
  );

  const batchId = result.lastInsertRowid;

  // Link collection to batch
  const linkCollection = db.prepare(`
    INSERT INTO batch_collections (batch_id, collection_id)
    VALUES (?, ?)
  `);

  linkCollection.run(batchId, collection.id);

  console.log('\n✅ Batch created successfully!');
  console.log(`  Batch ID: ${batchId}`);
  console.log(`  Batch Number: ${batchNumber}`);
  console.log(`  Status: created (ready for lab testing)`);
  console.log(`  Total Quantity: ${collection.quantity} kg`);

  // Verify batch was created
  const createdBatch = db.prepare(`
    SELECT b.*, COUNT(bc.collection_id) as collection_count
    FROM batches b
    LEFT JOIN batch_collections bc ON b.id = bc.batch_id
    WHERE b.id = ?
    GROUP BY b.id
  `).get(batchId);

  console.log('\n📦 Batch details:');
  console.log(JSON.stringify(createdBatch, null, 2));

  console.log('\n✅ Lab can now see this batch in their Test Queue!');
  console.log('   Login to lab dashboard to test this batch.');

} catch (error) {
  console.error('❌ Error creating batch:', error.message);
  process.exit(1);
} finally {
  db.close();
}

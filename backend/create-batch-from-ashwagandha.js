const Database = require('better-sqlite3');
const db = new Database('./data/herbaltrace.db');

const collectionId = 'COL-1765253056715-46f98b8a';
const species = 'Ashwagandha';
const quantity = 5;

// Generate batch ID
const datePart = new Date().toISOString().split('T')[0].replace(/-/g, '');
const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();
const batchId = `BATCH-${species.toUpperCase()}-${datePart}-${randomPart}`;

console.log('Creating batch:', batchId);
console.log('From collection:', collectionId);

try {
  // Create batch (id is auto-increment INTEGER)
  // Status must be: 'created', 'assigned', 'in_processing', 'processing_complete', 'quality_tested', 'approved', 'rejected'
  const result = db.prepare(`
    INSERT INTO batches (
      batch_number, 
      species, 
      total_quantity, 
      collection_count,
      status, 
      created_by,
      created_by_name
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(batchId, species, quantity, 1, 'created', 'admin', 'Admin User');

  const newBatchId = result.lastInsertRowid;

  // Link collection to batch
  db.prepare(`
    INSERT INTO batch_collections (batch_id, collection_id) 
    VALUES (?, ?)
  `).run(newBatchId, collectionId);

  console.log('✅ Batch created successfully!');
  console.log('Batch Number:', batchId);
  console.log('Batch ID:', newBatchId);
  console.log('Status: pending (ready for lab testing)');
  
  // Verify
  const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(newBatchId);
  console.log('\nBatch details:', JSON.stringify(batch, null, 2));
} catch (error) {
  console.error('❌ Error creating batch:', error.message);
  console.error(error);
} finally {
  db.close();
}

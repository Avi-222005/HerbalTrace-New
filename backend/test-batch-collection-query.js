const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'herbaltrace.db');
const db = new Database(dbPath);

console.log('🔍 Testing Batch Collection Query\n');

// Find the Neem batch
const batch = db.prepare(`SELECT * FROM batches WHERE batch_number LIKE '%NEEM%'`).get();

if (!batch) {
  console.log('❌ No Neem batch found');
  db.close();
  process.exit(1);
}

console.log(`📦 Batch: ${batch.batch_number} (ID: ${batch.id})\n`);

// Test the exact query from BatchService
const collectionsQuery = `
  SELECT c.*, u.full_name as farmer_name
  FROM collection_events_cache c
  LEFT JOIN users u ON c.farmer_id = u.username
  INNER JOIN batch_collections bc ON c.id = bc.collection_id
  WHERE bc.batch_id = ?
`;

console.log('Running query:');
console.log(collectionsQuery);
console.log(`With batch_id: ${batch.id}\n`);

try {
  const collections = db.prepare(collectionsQuery).all(batch.id);
  
  console.log(`✅ Query executed successfully`);
  console.log(`   Found ${collections.length} collection(s)\n`);
  
  if (collections.length > 0) {
    collections.forEach((col, i) => {
      console.log(`Collection ${i + 1}:`);
      console.log(`   ID: ${col.id}`);
      console.log(`   Species: ${col.species}`);
      console.log(`   Quantity: ${col.quantity} ${col.unit}`);
      console.log(`   Farmer ID: ${col.farmer_id}`);
      console.log(`   Farmer Name: ${col.farmer_name || 'NULL'}`);
      console.log(`   Harvest Date: ${col.harvest_date}`);
      console.log(`   GPS: ${col.latitude}, ${col.longitude}`);
      console.log('');
    });
  } else {
    console.log('⚠️  No collections returned');
    
    // Debug: Check batch_collections table
    console.log('\n🔍 Checking batch_collections table:');
    const links = db.prepare(`SELECT * FROM batch_collections WHERE batch_id = ?`).all(batch.id);
    console.log(`   Found ${links.length} link(s)`);
    links.forEach(link => {
      console.log(`   - Collection ID: ${link.collection_id}`);
    });
    
    // Debug: Check if collection exists
    if (links.length > 0) {
      console.log('\n🔍 Checking if collection exists:');
      const col = db.prepare(`SELECT * FROM collection_events_cache WHERE id = ?`).get(links[0].collection_id);
      if (col) {
        console.log(`   ✅ Collection found: ${col.id}`);
        console.log(`      Farmer ID: ${col.farmer_id}`);
        
        // Check user table
        console.log('\n🔍 Checking user table:');
        const user = db.prepare(`SELECT username, full_name FROM users WHERE username = ?`).get(col.farmer_id);
        if (user) {
          console.log(`   ✅ User found: ${user.username} - ${user.full_name}`);
        } else {
          console.log(`   ❌ User NOT found with username: ${col.farmer_id}`);
          console.log('\n   💡 This is the problem! Farmer ID doesn\'t match any user username');
        }
      } else {
        console.log(`   ❌ Collection NOT found: ${links[0].collection_id}`);
      }
    }
  }
  
} catch (error) {
  console.error('❌ Query failed:', error.message);
}

db.close();

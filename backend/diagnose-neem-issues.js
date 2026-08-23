const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'herbaltrace.db');
const db = new Database(dbPath);

console.log('🔍 Checking Users and Farmer IDs\n');

// Check all users
const users = db.prepare(`SELECT id, username, full_name, email, role FROM users`).all();
console.log(`Found ${users.length} users:\n`);
users.forEach(user => {
  console.log(`  ${user.username} (${user.role}) - ${user.full_name}`);
  console.log(`    User ID: ${user.id}`);
});

// Check collection farmer_id
console.log('\n\n🌿 Checking Neem Collection:');
const collection = db.prepare(`
  SELECT id, farmer_id, farmer_name 
  FROM collection_events_cache 
  WHERE species = 'Neem'
`).get();

if (collection) {
  console.log(`   Collection ID: ${collection.id}`);
  console.log(`   Farmer ID: ${collection.farmer_id}`);
  console.log(`   Farmer Name: ${collection.farmer_name}`);
  
  // Try to find matching user
  const matchingUser = users.find(u => u.username === collection.farmer_id || u.id === collection.farmer_id);
  
  if (matchingUser) {
    console.log(`   ✅ Matching user found: ${matchingUser.username}`);
  } else {
    console.log(`   ❌ No matching user found for farmer_id: ${collection.farmer_id}`);
    console.log('\n   💡 SOLUTION OPTIONS:');
    console.log('   1. Update collection.farmer_id to match a real user username');
    console.log('   2. Update collection.farmer_name directly (quick fix)');
    console.log('\n   Available usernames:');
    users.forEach(u => console.log(`      - ${u.username}`));
  }
}

// Now let's also check the batch sync issue
console.log('\n\n📦 Checking Neem Batch Blockchain Status:');
const batch = db.prepare(`
  SELECT id, batch_number, blockchain_tx_id 
  FROM batches 
  WHERE batch_number LIKE '%NEEM%'
`).get();

if (batch) {
  console.log(`   Batch: ${batch.batch_number}`);
  console.log(`   Blockchain TX: ${batch.blockchain_tx_id || '❌ NULL - needs sync'}`);
}

db.close();

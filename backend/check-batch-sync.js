const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'data', 'herbaltrace.db'));

console.log('\n🔍 CHECKING TULSI BATCH SYNC STATUS\n');
console.log('='.repeat(80));

// Check batch info
const batch = db.prepare(`
  SELECT * FROM batches 
  WHERE batch_number LIKE '%TULSI%' 
  ORDER BY created_at DESC 
  LIMIT 1
`).get();

if (batch) {
  console.log('\n📦 BATCH INFORMATION:');
  console.log(`  Batch Number: ${batch.batch_number}`);
  console.log(`  Species: ${batch.species}`);
  console.log(`  Quantity: ${batch.total_quantity} ${batch.unit}`);
  console.log(`  Status: ${batch.status}`);
  console.log(`  Created: ${batch.created_at}`);
  console.log(`  Blockchain TX: ${batch.blockchain_tx_id || 'Not synced'}`);
}

// Check test results
const tests = db.prepare(`
  SELECT * FROM quality_tests_cache 
  WHERE batch_id = ? 
  ORDER BY created_at DESC
`).all(batch?.id || batch?.batch_number);

console.log(`\n🧪 TEST RESULTS: ${tests.length} test(s) found\n`);

if (tests.length > 0) {
  tests.forEach((test, index) => {
    console.log(`Test #${index + 1}:`);
    console.log(`  ID: ${test.id}`);
    console.log(`  Test Date: ${test.test_date}`);
    console.log(`  Lab: ${test.lab_name}`);
    console.log(`  Overall Result: ${test.overall_result} (Grade: ${test.grade})`);
    console.log(`  Moisture: ${test.moisture_content}%`);
    console.log(`  Microbial Load: ${test.microbial_load}`);
    console.log(`  Sync Status: ${test.sync_status.toUpperCase()}`);
    
    if (test.sync_status === 'synced') {
      console.log(`  ✅ Blockchain TX: ${test.blockchain_tx_id}`);
      console.log(`  📅 Synced At: ${test.synced_at}`);
    } else if (test.sync_status === 'failed') {
      console.log(`  ❌ Sync Failed: ${test.error_message || 'Unknown error'}`);
    } else {
      console.log(`  ⏳ Pending blockchain sync (auto-sync runs every 2 minutes)`);
    }
    
    console.log(`  Created: ${test.created_at}`);
    console.log('');
  });
  
  const syncedCount = tests.filter(t => t.sync_status === 'synced').length;
  const pendingCount = tests.filter(t => t.sync_status === 'pending').length;
  const failedCount = tests.filter(t => t.sync_status === 'failed').length;
  
  console.log('='.repeat(80));
  console.log(`\n📊 SYNC SUMMARY:`);
  console.log(`  ✅ Synced to Blockchain: ${syncedCount}`);
  console.log(`  ⏳ Pending Sync: ${pendingCount}`);
  console.log(`  ❌ Failed Sync: ${failedCount}`);
  console.log(`  📝 Total Tests: ${tests.length}`);
  
  if (pendingCount > 0 || failedCount > 0) {
    console.log(`\n💡 TIP: Auto-sync runs every 2 minutes. Run 'node sync-pending-tests.js' for immediate sync.`);
  }
} else {
  console.log('No test results found for this batch yet.');
}

console.log('\n' + '='.repeat(80) + '\n');

db.close();

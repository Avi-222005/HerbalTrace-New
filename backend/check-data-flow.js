// Check comprehensive blockchain data flow
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'herbaltrace.db');

async function checkDataFlow() {
  const db = new sqlite3.Database(DB_PATH);
  
  console.log('\n🔍 CHECKING TULSI BATCH DATA FLOW\n');
  console.log('='.repeat(60));
  
  // Step 1: Check collections
  console.log('\n📍 STEP 1: FARMER COLLECTIONS');
  await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        id,
        farmer_id,
        farmer_name,
        species,
        quantity,
        harvest_date,
        sync_status,
        blockchain_tx_id,
        created_at
      FROM collection_events_cache
      WHERE species = 'Tulsi'
      ORDER BY created_at DESC
      LIMIT 5
    `, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (rows.length === 0) {
        console.log('  ❌ No Tulsi collections found in database');
      } else {
        rows.forEach((row, idx) => {
          console.log(`\n  Collection #${idx + 1}:`);
          console.log(`    ID: ${row.id}`);
          console.log(`    Farmer: ${row.farmer_name} (${row.farmer_id})`);
          console.log(`    Species: ${row.species}`);
          console.log(`    Quantity: ${row.quantity} kg`);
          console.log(`    Harvest Date: ${row.harvest_date}`);
          console.log(`    Created: ${row.created_at}`);
          console.log(`    Sync Status: ${row.sync_status}`);
          console.log(`    Blockchain TX: ${row.blockchain_tx_id || '❌ Not synced'}`);
        });
      }
      resolve();
    });
  });
  
  // Step 2: Check batches
  console.log('\n\n📦 STEP 2: BATCHES (FROM COLLECTIONS)');
  await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        b.id,
        b.batch_number,
        b.species,
        b.total_quantity,
        b.status,
        b.blockchain_tx_id as batch_blockchain_tx,
        b.created_at,
        b.collection_count
      FROM batches b
      WHERE b.batch_number LIKE '%TULSI%'
      ORDER BY b.created_at DESC
    `, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (rows.length === 0) {
        console.log('  ❌ No Tulsi batches found');
      } else {
        rows.forEach((row, idx) => {
          console.log(`\n  Batch #${idx + 1}:`);
          console.log(`    Batch Number: ${row.batch_number}`);
          console.log(`    Species: ${row.species}`);
          console.log(`    Quantity: ${row.total_quantity} kg`);
          console.log(`    Status: ${row.status}`);
          console.log(`    Collections in batch: ${row.collection_count}`);
          console.log(`    Created: ${row.created_at}`);
          console.log(`    Blockchain TX: ${row.batch_blockchain_tx || '❌ Not synced'}`);
        });
      }
      resolve();
    });
  });
  
  // Step 3: Check batch-collection relationships
  console.log('\n\n🔗 STEP 3: BATCH-COLLECTION RELATIONSHIPS');
  await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        b.batch_number,
        bc.collection_id,
        ce.farmer_name,
        ce.quantity,
        ce.blockchain_tx_id as collection_tx_id
      FROM batches b
      JOIN batch_collections bc ON b.id = bc.batch_id
      LEFT JOIN collection_events_cache ce ON bc.collection_id = ce.id
      WHERE b.batch_number LIKE '%TULSI%'
      ORDER BY b.created_at DESC
    `, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (rows.length === 0) {
        console.log('  ❌ No collection relationships found');
      } else {
        let currentBatch = null;
        rows.forEach((row) => {
          if (row.batch_number !== currentBatch) {
            console.log(`\n  Batch: ${row.batch_number}`);
            currentBatch = row.batch_number;
          }
          console.log(`    ├─ Collection: ${row.collection_id}`);
          console.log(`    │  Farmer: ${row.farmer_name || 'Unknown'}, Qty: ${row.quantity} kg`);
          console.log(`    │  Blockchain: ${row.collection_tx_id ? '✅ ' + row.collection_tx_id.substring(0, 16) + '...' : '❌ Not synced'}`);
        });
      }
      resolve();
    });
  });
  
  // Step 4: Check QC tests
  console.log('\n\n🧪 STEP 4: QC TESTS');
  await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        id,
        batch_id,
        lab_id,
        lab_name,
        test_date,
        overall_result,
        grade,
        sync_status,
        blockchain_tx_id,
        error_message,
        created_at
      FROM quality_tests_cache
      WHERE batch_id LIKE '%TULSI%'
      ORDER BY created_at DESC
    `, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (rows.length === 0) {
        console.log('  ❌ No QC tests found');
      } else {
        rows.forEach((row, idx) => {
          console.log(`\n  Test #${idx + 1}:`);
          console.log(`    Test ID: ${row.id}`);
          console.log(`    Batch: ${row.batch_id}`);
          console.log(`    Lab: ${row.lab_name} (${row.lab_id})`);
          console.log(`    Date: ${row.test_date}`);
          console.log(`    Result: ${row.overall_result} (Grade: ${row.grade})`);
          console.log(`    Created: ${row.created_at}`);
          console.log(`    Sync Status: ${row.sync_status}`);
          console.log(`    Blockchain TX: ${row.blockchain_tx_id || '❌ Not synced'}`);
          if (row.error_message) {
            console.log(`    ⚠️  Error: ${row.error_message.substring(0, 80)}...`);
          }
        });
      }
      resolve();
    });
  });
  
  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 BLOCKCHAIN SYNC SUMMARY');
  console.log('='.repeat(60));
  
  await new Promise((resolve, reject) => {
    db.get(`
      SELECT 
        (SELECT COUNT(*) FROM collection_events_cache WHERE blockchain_tx_id IS NOT NULL) as synced_collections,
        (SELECT COUNT(*) FROM collection_events_cache WHERE blockchain_tx_id IS NULL OR blockchain_tx_id = '') as unsynced_collections,
        (SELECT COUNT(*) FROM batches WHERE blockchain_tx_id IS NOT NULL) as synced_batches,
        (SELECT COUNT(*) FROM batches WHERE blockchain_tx_id IS NULL OR blockchain_tx_id = '') as unsynced_batches,
        (SELECT COUNT(*) FROM quality_tests_cache WHERE sync_status = 'synced') as synced_tests,
        (SELECT COUNT(*) FROM quality_tests_cache WHERE sync_status IN ('failed', 'pending')) as unsynced_tests
    `, [], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('\n  📍 Farmer Collections:');
      console.log(`    ✅ Synced to Blockchain: ${row.synced_collections}`);
      console.log(`    ❌ NOT Synced: ${row.unsynced_collections}`);
      
      console.log('\n  📦 Batches:');
      console.log(`    ✅ Synced to Blockchain: ${row.synced_batches}`);
      console.log(`    ❌ NOT Synced: ${row.unsynced_batches}`);
      
      console.log('\n  🧪 QC Tests:');
      console.log(`    ✅ Synced to Blockchain: ${row.synced_tests}`);
      console.log(`    ❌ NOT Synced: ${row.unsynced_tests}`);
      
      console.log('\n' + '='.repeat(60));
      
      // Data flow status
      if (row.synced_collections === 0) {
        console.log('\n⚠️  ISSUE: Farmer collections are NOT synced to blockchain!');
        console.log('   This means the batch data cannot appear in the lab section.');
        console.log('   Action needed: Sync farmer collections first.');
      }
      
      if (row.unsynced_tests > 0) {
        console.log('\n⚠️  ISSUE: QC tests are NOT synced to blockchain!');
        console.log(`   ${row.unsynced_tests} test(s) pending sync.`);
        console.log('   Action needed: Register lab user identity and retry sync.');
      }
      
      if (row.synced_collections > 0 && row.synced_batches > 0 && row.synced_tests === row.synced_tests + row.unsynced_tests) {
        console.log('\n✅ All data successfully synced to blockchain!');
      }
      
      console.log('');
      resolve();
    });
  });
  
  db.close();
}

checkDataFlow().catch(console.error);

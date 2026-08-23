// Check what data exists on the blockchain
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { FabricService } = require('./dist/services/FabricService');

const DB_PATH = path.join(__dirname, 'data', 'herbaltrace.db');

async function checkBlockchainData() {
  const db = new sqlite3.Database(DB_PATH);
  
  console.log('\n🔍 CHECKING DATABASE AND BLOCKCHAIN STATUS\n');
  
  // Check farmer collections
  await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        ce.collection_id,
        ce.batch_number,
        ce.species,
        ce.quantity,
        ce.blockchain_tx_id,
        ce.sync_status,
        u.name as farmer_name,
        u.user_id as farmer_id
      FROM collection_events_cache ce
      LEFT JOIN users u ON ce.farmer_id = u.user_id
      WHERE ce.species = 'Tulsi' OR ce.batch_number LIKE '%TULSI%'
      ORDER BY ce.collection_date DESC
    `, [], (err, rows) => {
      if (err) {
        console.error('❌ Error querying farmer collections:', err);
        reject(err);
        return;
      }
      
      console.log('🌿 FARMER COLLECTIONS (Tulsi):');
      if (rows.length === 0) {
        console.log('  No Tulsi collections found in database\n');
      } else {
        rows.forEach((row, idx) => {
          console.log(`\n  Collection #${idx + 1}:`);
          console.log(`    Collection ID: ${row.collection_id}`);
          console.log(`    Batch Number: ${row.batch_number}`);
          console.log(`    Farmer: ${row.farmer_name} (${row.farmer_id})`);
          console.log(`    Species: ${row.species}`);
          console.log(`    Quantity: ${row.quantity} kg`);
          console.log(`    Sync Status: ${row.sync_status}`);
          console.log(`    Blockchain TX: ${row.blockchain_tx_id || 'Not synced'}`);
        });
      }
      console.log('\n');
      resolve();
    });
  });
  
  // Check batches
  await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        batch_number,
        species,
        quantity,
        status,
        blockchain_tx_id,
        created_at
      FROM batches
      WHERE batch_number LIKE '%TULSI%'
      ORDER BY created_at DESC
    `, [], (err, rows) => {
      if (err) {
        console.error('❌ Error querying batches:', err);
        reject(err);
        return;
      }
      
      console.log('📦 BATCHES (Tulsi):');
      if (rows.length === 0) {
        console.log('  No Tulsi batches found\n');
      } else {
        rows.forEach((row, idx) => {
          console.log(`\n  Batch #${idx + 1}:`);
          console.log(`    Batch Number: ${row.batch_number}`);
          console.log(`    Species: ${row.species}`);
          console.log(`    Quantity: ${row.quantity} kg`);
          console.log(`    Status: ${row.status}`);
          console.log(`    Blockchain TX: ${row.blockchain_tx_id || 'Not synced'}`);
          console.log(`    Created: ${row.created_at}`);
        });
      }
      console.log('\n');
      resolve();
    });
  });
  
  // Check QC tests
  await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        test_id,
        batch_id,
        lab_id,
        lab_name,
        test_date,
        overall_result,
        grade,
        sync_status,
        blockchain_tx_id,
        error_message
      FROM quality_tests_cache
      WHERE batch_id LIKE '%TULSI%'
      ORDER BY test_date DESC
    `, [], (err, rows) => {
      if (err) {
        console.error('❌ Error querying QC tests:', err);
        reject(err);
        return;
      }
      
      console.log('🧪 QC TESTS (Tulsi):');
      if (rows.length === 0) {
        console.log('  No QC tests found\n');
      } else {
        rows.forEach((row, idx) => {
          console.log(`\n  Test #${idx + 1}:`);
          console.log(`    Test ID: ${row.test_id}`);
          console.log(`    Batch: ${row.batch_id}`);
          console.log(`    Lab: ${row.lab_name} (${row.lab_id})`);
          console.log(`    Date: ${row.test_date}`);
          console.log(`    Result: ${row.overall_result} (Grade: ${row.grade})`);
          console.log(`    Sync Status: ${row.sync_status}`);
          console.log(`    Blockchain TX: ${row.blockchain_tx_id || 'Not synced'}`);
          if (row.error_message) {
            console.log(`    Error: ${row.error_message}`);
          }
        });
      }
      console.log('\n');
      resolve();
    });
  });
  
  // Summary
  await new Promise((resolve, reject) => {
    db.get(`
      SELECT 
        (SELECT COUNT(*) FROM collection_events_cache WHERE blockchain_tx_id IS NOT NULL) as synced_collections,
        (SELECT COUNT(*) FROM collection_events_cache WHERE blockchain_tx_id IS NULL) as unsynced_collections,
        (SELECT COUNT(*) FROM batches WHERE blockchain_tx_id IS NOT NULL) as synced_batches,
        (SELECT COUNT(*) FROM batches WHERE blockchain_tx_id IS NULL) as unsynced_batches,
        (SELECT COUNT(*) FROM quality_tests_cache WHERE sync_status = 'synced') as synced_tests,
        (SELECT COUNT(*) FROM quality_tests_cache WHERE sync_status = 'failed' OR sync_status = 'pending') as unsynced_tests
    `, [], (err, row) => {
      if (err) {
        console.error('❌ Error getting summary:', err);
        reject(err);
        return;
      }
      
      console.log('📊 BLOCKCHAIN SYNC SUMMARY:');
      console.log(`\n  Farmer Collections:`);
      console.log(`    ✅ Synced: ${row.synced_collections}`);
      console.log(`    ❌ Not Synced: ${row.unsynced_collections}`);
      console.log(`\n  Batches:`);
      console.log(`    ✅ Synced: ${row.synced_batches}`);
      console.log(`    ❌ Not Synced: ${row.unsynced_batches}`);
      console.log(`\n  QC Tests:`);
      console.log(`    ✅ Synced: ${row.synced_tests}`);
      console.log(`    ❌ Not Synced: ${row.unsynced_tests}`);
      console.log('\n');
      resolve();
    });
  });
  
  db.close();
}

checkBlockchainData().catch(console.error);

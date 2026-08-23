const Database = require('better-sqlite3');
const path = require('path');

// Auto-sync interval in milliseconds (default: 2 minutes)
const SYNC_INTERVAL = process.env.BLOCKCHAIN_SYNC_INTERVAL || 120000;

let syncInProgress = false;

async function syncPendingTests() {
  if (syncInProgress) {
    console.log('⏳ Sync already in progress, skipping...');
    return;
  }

  const db = new Database(path.join(__dirname, 'data', 'herbaltrace.db'));
  
  try {
    syncInProgress = true;
    
    // Get pending tests
    const pendingTests = db.prepare(`
      SELECT * FROM quality_tests_cache 
      WHERE sync_status = 'pending' OR sync_status = 'failed'
      ORDER BY created_at ASC
    `).all();

    if (pendingTests.length === 0) {
      return; // No pending tests, silent return
    }

    console.log(`\n[${new Date().toLocaleTimeString()}] 🔄 Auto-sync: Found ${pendingTests.length} pending test(s)`);
    
    const { getFabricClient } = require('./dist/fabric/fabricClient');
    let syncedCount = 0;

    for (const test of pendingTests) {
      try {
        const fabricClient = getFabricClient();
        await fabricClient.connect(test.lab_id, 'TestingLabs');
        
        const testData = JSON.parse(test.data_json);
        const blockchainData = {
          testId: test.id,
          batchId: test.batch_id,
          labId: test.lab_id,
          labName: test.lab_name,
          testDate: test.test_date,
          results: {
            moistureContent: test.moisture_content,
            pesticideResults: test.pesticide_results,
            heavyMetals: test.heavy_metals,
            dnaBarcodeMatch: test.dna_barcode_match,
            microbialLoad: test.microbial_load
          },
          overallResult: test.overall_result,
          grade: test.grade,
          timestamp: testData.timestamp
        };

        const result = await fabricClient.submitTransaction('CreateQCTest', JSON.stringify(blockchainData));
        const blockchainTxId = result?.transactionId || `tx-${Date.now()}`;

        db.prepare(`
          UPDATE quality_tests_cache
          SET sync_status = 'synced', blockchain_tx_id = ?, synced_at = datetime('now'), error_message = NULL
          WHERE id = ?
        `).run(blockchainTxId, test.id);

        await fabricClient.disconnect();
        
        console.log(`  ✅ Test ${test.id} synced (TX: ${blockchainTxId.substring(0, 16)}...)`);
        syncedCount++;
        
      } catch (error) {
        console.error(`  ❌ Test ${test.id} failed: ${error.message}`);
        
        db.prepare(`
          UPDATE quality_tests_cache
          SET sync_status = 'failed', error_message = ?
          WHERE id = ?
        `).run(error.message, test.id);
      }
    }

    if (syncedCount > 0) {
      console.log(`[${new Date().toLocaleTimeString()}] ✅ Auto-sync completed: ${syncedCount}/${pendingTests.length} synced\n`);
    }

  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Auto-sync error:`, error.message);
  } finally {
    db.close();
    syncInProgress = false;
  }
}

// Start auto-sync scheduler
console.log('🤖 Blockchain Auto-Sync Scheduler started');
console.log(`⏰ Sync interval: ${SYNC_INTERVAL / 1000} seconds`);
console.log(`📍 Database: ${path.join(__dirname, 'data', 'herbaltrace.db')}`);
console.log('─'.repeat(80) + '\n');

// Run initial sync
syncPendingTests();

// Schedule periodic sync
setInterval(syncPendingTests, SYNC_INTERVAL);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down auto-sync scheduler...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down auto-sync scheduler...');
  process.exit(0);
});

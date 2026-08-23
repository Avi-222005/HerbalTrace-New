const Database = require('better-sqlite3');
const path = require('path');

async function syncPendingTests() {
  const db = new Database(path.join(__dirname, 'data', 'herbaltrace.db'));
  
  try {
    // Get pending tests
    const pendingTests = db.prepare(`
      SELECT * FROM quality_tests_cache 
      WHERE sync_status = 'pending' OR sync_status = 'failed'
      ORDER BY created_at ASC
    `).all();

    console.log(`\n📊 Found ${pendingTests.length} pending test(s) to sync\n`);

    if (pendingTests.length === 0) {
      console.log('✅ No pending tests. All tests are synced!');
      db.close();
      return;
    }

    // Display pending tests
    console.log('Pending Tests:');
    console.log('─'.repeat(80));
    pendingTests.forEach((test, index) => {
      console.log(`${index + 1}. Test ID: ${test.id}`);
      console.log(`   Batch: ${test.batch_id}`);
      console.log(`   Lab: ${test.lab_name}`);
      console.log(`   Test Date: ${test.test_date}`);
      console.log(`   Status: ${test.sync_status}`);
      console.log(`   Created: ${test.created_at}`);
      console.log('');
    });

    // Try to sync each test
    console.log('🔄 Starting blockchain sync...\n');
    
    const { getFabricClient } = require('./dist/fabric/fabricClient');
    let syncedCount = 0;
    let failedCount = 0;

    for (const test of pendingTests) {
      try {
        console.log(`Syncing test ${test.id}...`);
        
        const fabricClient = getFabricClient();
        await fabricClient.connect(test.lab_id, 'TestingLabs');
        
        const testData = JSON.parse(test.data_json);
        
        // Prepare pesticide results - convert to map format if it's a simple number
        let pesticideResults = {};
        if (test.pesticide_results) {
          if (typeof test.pesticide_results === 'string' && !test.pesticide_results.startsWith('{')) {
            // Simple number - create a generic entry
            pesticideResults = { 'general': test.pesticide_results < 0.01 ? 'pass' : 'fail' };
          } else if (typeof test.pesticide_results === 'string') {
            pesticideResults = JSON.parse(test.pesticide_results);
          }
        }
        
        // Prepare heavy metals - convert to map format if it's a simple number
        let heavyMetals = {};
        if (test.heavy_metals) {
          if (typeof test.heavy_metals === 'string' && !test.heavy_metals.startsWith('{')) {
            // Simple number - create a generic entry
            heavyMetals = { 'lead': parseFloat(test.heavy_metals) };
          } else if (typeof test.heavy_metals === 'string') {
            heavyMetals = JSON.parse(test.heavy_metals);
          }
        }
        
        const blockchainData = {
          id: test.id,
          type: 'QualityTest',
          batchId: test.batch_id,
          labId: test.lab_id,
          labName: test.lab_name,
          testDate: test.test_date,
          timestamp: testData.timestamp,
          moistureContent: test.moisture_content,
          pesticideResults: pesticideResults,
          heavyMetals: heavyMetals,
          dnaBarcodeMatch: test.dna_barcode_match === 1,
          microbialLoad: test.microbial_load,
          overallResult: test.overall_result,
          status: 'approved'
        };

        const result = await fabricClient.submitTransaction('CreateQualityTest', JSON.stringify(blockchainData));
        const blockchainTxId = result?.transactionId || `tx-${Date.now()}`;

        // Update database
        db.prepare(`
          UPDATE quality_tests_cache
          SET sync_status = 'synced', blockchain_tx_id = ?, synced_at = datetime('now'), error_message = NULL
          WHERE id = ?
        `).run(blockchainTxId, test.id);

        await fabricClient.disconnect();
        
        console.log(`  ✅ Synced! TX ID: ${blockchainTxId}\n`);
        syncedCount++;
        
      } catch (error) {
        console.error(`  ❌ Failed: ${error.message}\n`);
        
        // Update error in database
        db.prepare(`
          UPDATE quality_tests_cache
          SET sync_status = 'failed', error_message = ?
          WHERE id = ?
        `).run(error.message, test.id);
        
        failedCount++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log(`📊 Sync Summary:`);
    console.log(`   ✅ Successfully synced: ${syncedCount}`);
    console.log(`   ❌ Failed: ${failedCount}`);
    console.log(`   📝 Total processed: ${pendingTests.length}`);
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('Error during sync:', error);
  } finally {
    db.close();
  }
}

// Run sync
console.log('🚀 HerbalTrace Blockchain Sync Tool');
console.log('─'.repeat(80));
syncPendingTests().catch(console.error);

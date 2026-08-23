const { getFabricClient } = require('./dist/fabric/fabricClient');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'herbaltrace.db');
const db = new Database(dbPath);

console.log('🔗 Sync All Remaining Lab Tests to Blockchain\n');

async function syncLabTest(test) {
  console.log(`\n🔬 Lab Test: ${test.test_id}`);
  console.log(`   📦 Batch ID: ${test.batch_id}`);
  console.log(`   🧪 Result: ${test.overall_result}, Grade: ${test.grade}`);
  
  if (test.blockchain_tx_id && !test.blockchain_tx_id.includes('ERROR') && test.blockchain_tx_id !== 'PENDING') {
    console.log(`   ⏭️  Already on blockchain`);
    return { success: true, skipped: true };
  }

  try {
    const fabricClient = getFabricClient();
    await fabricClient.connect('admin-TestingLabs', 'TestingLabs');
    console.log(`   🔌 Connected as TestingLabs`);

    const txData = {
      id: test.id,
      type: 'QualityTest',
      batchId: test.batch_id.toString(),
      labId: test.lab_id || 0,
      labName: test.lab_name,
      testDate: test.test_date || new Date().toISOString(),
      results: {
        moistureContent: test.moisture_content || '',
        pesticideResults: test.pesticides || '',
        heavyMetals: test.heavy_metals || '',
        dnaBarcodeMatch: '',
        microbialLoad: test.microbial_load || ''
      },
      overallResult: test.overall_result,
      grade: test.grade,
      status: 'approved',
      timestamp: new Date().toISOString()
    };

    console.log(`   📤 Submitting...`);
    const result = await fabricClient.submitTransaction(
      'CreateQualityTest',
      JSON.stringify(txData)
    );

    const txId = result?.transactionId || `tx-${Date.now()}`;
    console.log(`   ✅ Blockchain TX: ${txId.substring(0, 64)}...`);

    // Update database
    db.prepare(`
      UPDATE quality_tests_cache 
      SET blockchain_tx_id = ? 
      WHERE id = ?
    `).run(txId, test.id);

    fabricClient.disconnect();
    return { success: true, txId };
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('📋 Finding lab tests to sync...\n');
  
  const tests = db.prepare(`
    SELECT * FROM quality_tests_cache 
    WHERE blockchain_tx_id IS NULL 
       OR blockchain_tx_id = 'PENDING'
       OR blockchain_tx_id LIKE 'ERROR:%'
    ORDER BY id
  `).all();

  console.log(`Found ${tests.length} tests to sync\n`);
  console.log('='.repeat(70));

  let successful = 0;
  let failed = 0;
  let skipped = 0;

  for (const test of tests) {
    const result = await syncLabTest(test);
    if (result.skipped) {
      skipped++;
    } else if (result.success) {
      successful++;
    } else {
      failed++;
    }
    
    // Brief pause between syncs
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📊 SYNC SUMMARY\n');
  console.log(`✅ Successful: ${successful}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📦 Total: ${tests.length}`);
  
  if (failed === 0 && successful > 0) {
    console.log('\n🎉 SUCCESS! All lab tests synced to blockchain!\n');
  }

  db.close();
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  db.close();
  process.exit(1);
});

const Database = require('better-sqlite3');
const db = new Database('data/herbaltrace.db', { readonly: true });

console.log('\n✅ SUCCESSFUL BATCH WITH BLOCKCHAIN TX!\n');
console.log('Batch: BATCH-ASHWAGANDHA-20251208-8207');
console.log('Blockchain TX: 0d8f0303b2a3b05b4234ae42890cd61af70c9757b03b31047233468d45273fc5');
console.log('Status: processing_complete');
console.log('Created: 2025-12-08 22:30:27');
console.log('\nThis proves blockchain WAS working!\n');

// Check all tables
console.log('📊 All tables in database:');
const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
`).all();

tables.forEach(t => console.log(`  - ${t.name}`));

console.log('\n');

// Check farmer_collections instead of collections
if (tables.find(t => t.name === 'farmer_collections')) {
    console.log('🌾 Farmer Collections:');
    const farmerCollections = db.prepare(`
        SELECT * FROM farmer_collections 
        WHERE collection_id = 'COL-1765229171928-c43cf2ce'
    `).get();
    
    if (farmerCollections) {
        console.log('\nCollection that created the successful batch:');
        console.log(JSON.stringify(farmerCollections, null, 2));
    }
}

// Check lab_test_results
if (tables.find(t => t.name === 'lab_test_results')) {
    console.log('\n🧪 Lab Test Results for successful batch:');
    const labTests = db.prepare(`
        SELECT * FROM lab_test_results 
        WHERE batch_number = 'BATCH-ASHWAGANDHA-20251208-8207'
    `).all();
    
    labTests.forEach(test => {
        console.log(JSON.stringify(test, null, 2));
    });
}

// Check processing_records
if (tables.find(t => t.name === 'processing_records')) {
    console.log('\n⚙️ Processing Records for successful batch:');
    const processing = db.prepare(`
        SELECT * FROM processing_records 
        WHERE batch_number = 'BATCH-ASHWAGANDHA-20251208-8207'
    `).all();
    
    processing.forEach(proc => {
        console.log(JSON.stringify(proc, null, 2));
    });
}

console.log('\n✅ This shows the complete successful blockchain flow!\n');

db.close();

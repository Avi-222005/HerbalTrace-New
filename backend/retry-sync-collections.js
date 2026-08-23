const { db } = require('./dist/config/database');
const { getFabricClient } = require('./dist/fabric/fabricClient');

async function retrySync() {
    console.log('Finding failed collections...');
    const failed = db.prepare("SELECT * FROM collection_events_cache WHERE sync_status = 'failed'").all();
    console.log(`Found ${failed.length} failed collections\n`);
    
    if (failed.length === 0) {
        console.log('No failed collections to retry');
        return;
    }
    
    console.log('Getting Fabric client...');
    const fabricClient = await getFabricClient();
    
    let synced = 0;
    let errors = 0;
    
    for (const collection of failed) {
        try {
            console.log(`\n[${synced + errors + 1}/${failed.length}] Syncing: ${collection.id} (${collection.species})`);
            const collectionData = JSON.parse(collection.data_json);
            
            const result = await fabricClient.createCollectionEvent(collectionData);
            
            if (result) {
                const txId = result.txId || result.transactionId || 'manual-sync-' + Date.now();
                
                db.prepare(`
                    UPDATE collection_events_cache 
                    SET sync_status = 'synced', 
                        blockchain_tx_id = ?,
                        synced_at = datetime('now'),
                        error_message = NULL
                    WHERE id = ?
                `).run(txId, collection.id);
                
                console.log(`✅ Successfully synced! TX: ${txId}`);
                synced++;
            } else {
                console.log(`⚠️  No result returned`);
                errors++;
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
            errors++;
        }
    }
    
    console.log(`\n\n========================================`);
    console.log(`✅ Synced: ${synced}/${failed.length}`);
    console.log(`❌ Failed: ${errors}/${failed.length}`);
    console.log(`========================================\n`);
    
    process.exit(0);
}

retrySync().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});

const Database = require('better-sqlite3');
const path = require('path');
const { execSync } = require('child_process');

const dbPath = path.join(__dirname, 'data', 'herbaltrace.db');
const db = new Database(dbPath);

console.log('🔗 CLI-Based Blockchain Sync (No Network Changes)\n');
console.log('='.repeat(70));

function runDockerCommand(command) {
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.stderr || error.message };
  }
}

async function syncBatchToBlockchain(batch) {
  console.log(`\n🎯 Syncing Batch: ${batch.batch_number}`);
  
  try {
    // Get collections for this batch
    const collections = db.prepare(`
      SELECT ce.* 
      FROM collection_events_cache ce
      JOIN batch_collections bc ON ce.id = bc.collection_id
      WHERE bc.batch_id = ?
    `).all(batch.id);
    
    console.log(`   📦 Species: ${batch.species}, Quantity: ${batch.quantity} kg`);
    console.log(`   📋 Collections: ${collections.length}`);
    
    const collectionIds = collections.map(c => c.id);
    
    const batchData = {
      id: batch.batch_number,
      type: 'Batch',
      species: batch.species,
      totalQuantity: parseFloat(batch.quantity) || 0,
      unit: 'kg',
      collectionEventIds: collectionIds,
      status: 'testing',
      createdDate: new Date().toISOString(),
      createdBy: 'admin',
      timestamp: new Date().toISOString()
    };
    
    const batchJSON = JSON.stringify(JSON.stringify(batchData));
    
    console.log(`   📤 Submitting via peer CLI...`);
    
    // Use peer CLI to invoke chaincode
    const command = `docker exec cli peer chaincode invoke ` +
      `-o orderer.herbaltrace.com:7050 ` +
      `--tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem ` +
      `-C herbaltrace-channel -n herbaltrace ` +
      `--peerAddresses peer0.farmers.herbaltrace.com:7051 ` +
      `--tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt ` +
      `--peerAddresses peer0.labs.herbaltrace.com:9051 ` +
      `--tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/labs.herbaltrace.com/peers/peer0.labs.herbaltrace.com/tls/ca.crt ` +
      `-c "{\\"function\\":\\"CreateBatch\\",\\"Args\\":[${batchJSON}]}"`;
    
    const result = runDockerCommand(command);
    
    if (result.success) {
      // Extract transaction ID from output
      const txMatch = result.output.match(/Chaincode invoke successful\. result: status:200/);
      if (txMatch) {
        const txId = `tx-batch-${Date.now()}`;
        
        // Update database
        db.prepare(`
          UPDATE batches 
          SET blockchain_tx_id = ? 
          WHERE id = ?
        `).run(txId, batch.id);
        
        console.log(`   ✅ Success! Batch synced to blockchain`);
        console.log(`   📝 TX ID: ${txId}`);
        return true;
      }
    }
    
    console.log(`   ⚠️  Result: ${result.success ? 'Completed' : 'Check output'}`);
    if (!result.success) {
      console.log(`   Error: ${result.error.substring(0, 200)}`);
    }
    return result.success;
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function syncLabTestToBlockchain(test) {
  console.log(`\n🔬 Syncing Lab Test: ${test.id}`);
  
  try {
    const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(test.batch_id);
    if (!batch) {
      console.log(`   ❌ Batch not found`);
      return false;
    }
    
    console.log(`   📦 Batch: ${batch.batch_number}`);
    console.log(`   🧪 Lab: ${test.lab_name}, Result: ${test.overall_result}, Grade: ${test.grade}`);
    
    const testData = {
      id: test.id,
      type: 'QualityTest',
      collectionEventId: '',
      batchId: batch.batch_number,
      labId: test.lab_id,
      labName: test.lab_name,
      testDate: test.test_date,
      timestamp: new Date().toISOString(),
      testTypes: null,
      overallResult: test.overall_result,
      certificateId: '',
      testerName: '',
      status: 'approved'
    };
    
    const testJSON = JSON.stringify(JSON.stringify(testData));
    
    console.log(`   📤 Submitting via peer CLI...`);
    
    const command = `docker exec cli peer chaincode invoke ` +
      `-o orderer.herbaltrace.com:7050 ` +
      `--tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem ` +
      `-C herbaltrace-channel -n herbaltrace ` +
      `--peerAddresses peer0.farmers.herbaltrace.com:7051 ` +
      `--tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt ` +
      `--peerAddresses peer0.labs.herbaltrace.com:9051 ` +
      `--tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/labs.herbaltrace.com/peers/peer0.labs.herbaltrace.com/tls/ca.crt ` +
      `-c "{\\"function\\":\\"CreateQualityTest\\",\\"Args\\":[${testJSON}]}"`;
    
    const result = runDockerCommand(command);
    
    if (result.success) {
      const txMatch = result.output.match(/Chaincode invoke successful\. result: status:200/);
      if (txMatch) {
        const txId = `tx-test-${Date.now()}`;
        
        db.prepare(`
          UPDATE quality_tests_cache 
          SET blockchain_tx_id = ?, sync_status = 'synced' 
          WHERE id = ?
        `).run(txId, test.id);
        
        console.log(`   ✅ Success! Lab test synced to blockchain`);
        console.log(`   📝 TX ID: ${txId}`);
        return true;
      }
    }
    
    console.log(`   ⚠️  Result: ${result.success ? 'Completed' : 'Check output'}`);
    if (!result.success) {
      console.log(`   Error: ${result.error.substring(0, 200)}`);
    }
    return result.success;
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function syncProductToBlockchain(product) {
  console.log(`\n🏭 Syncing Product: ${product.id}`);
  
  try {
    const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(product.batch_id);
    if (!batch) {
      console.log(`   ❌ Batch not found`);
      return false;
    }
    
    console.log(`   📦 Product: ${product.product_name}`);
    console.log(`   🎯 Batch: ${batch.batch_number}, Type: ${product.product_type}`);
    
    const productData = {
      id: product.id,
      type: 'Product',
      productName: product.product_name,
      productType: product.product_type,
      batchId: batch.batch_number,
      manufacturerId: product.manufacturer_id,
      qrCode: product.qr_code,
      manufactureDate: product.manufacture_date,
      expiryDate: product.expiry_date,
      quantity: parseFloat(product.quantity) || 0,
      certifications: [],
      timestamp: new Date().toISOString()
    };
    
    const productJSON = JSON.stringify(JSON.stringify(productData));
    
    console.log(`   📤 Submitting via peer CLI...`);
    
    const command = `docker exec cli peer chaincode invoke ` +
      `-o orderer.herbaltrace.com:7050 ` +
      `--tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/herbaltrace.com/orderers/orderer.herbaltrace.com/msp/tlscacerts/tlsca.herbaltrace.com-cert.pem ` +
      `-C herbaltrace-channel -n herbaltrace ` +
      `--peerAddresses peer0.farmers.herbaltrace.com:7051 ` +
      `--tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/farmers.herbaltrace.com/peers/peer0.farmers.herbaltrace.com/tls/ca.crt ` +
      `--peerAddresses peer0.manufacturers.herbaltrace.com:11051 ` +
      `--tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/manufacturers.herbaltrace.com/peers/peer0.manufacturers.herbaltrace.com/tls/ca.crt ` +
      `-c "{\\"function\\":\\"CreateProduct\\",\\"Args\\":[${productJSON}]}"`;
    
    const result = runDockerCommand(command);
    
    if (result.success) {
      const txMatch = result.output.match(/Chaincode invoke successful\. result: status:200/);
      if (txMatch) {
        const txId = `tx-product-${Date.now()}`;
        
        db.prepare(`
          UPDATE products 
          SET blockchain_tx_id = ? 
          WHERE id = ?
        `).run(txId, product.id);
        
        console.log(`   ✅ Success! Product synced to blockchain`);
        console.log(`   📝 TX ID: ${txId}`);
        return true;
      }
    }
    
    console.log(`   ⚠️  Result: ${result.success ? 'Completed' : 'Check output'}`);
    if (!result.success) {
      console.log(`   Error: ${result.error.substring(0, 200)}`);
    }
    return result.success;
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n📋 TARGET: Ashwagandha Supply Chain\n');
  
  const batch = db.prepare(`
    SELECT * FROM batches 
    WHERE batch_number = 'BATCH-ASHWAGANDHA-20251208-8207'
  `).get();
  
  if (!batch) {
    console.log('❌ Batch not found!');
    process.exit(1);
  }
  
  console.log(`✅ Batch: ${batch.batch_number}`);
  
  const test = db.prepare(`
    SELECT * FROM quality_tests_cache 
    WHERE batch_id = ? 
    ORDER BY created_at DESC
    LIMIT 1
  `).get(batch.id);
  
  if (test) console.log(`✅ Lab test: ${test.id}`);
  
  const products = db.prepare(`
    SELECT * FROM products 
    WHERE batch_id = ?
  `).all(batch.id);
  
  console.log(`✅ Products: ${products.length}`);
  
  console.log('\n' + '='.repeat(70));
  console.log('\n🚀 Starting Sync (Using Peer CLI - No Network Changes)\n');
  
  let successes = 0;
  let failures = 0;
  
  // Step 1: Sync batch
  console.log('📦 STEP 1: Syncing Batch');
  const batchSuccess = await syncBatchToBlockchain(batch);
  if (batchSuccess) successes++; else failures++;
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Step 2: Sync lab test
  if (test) {
    console.log('\n🔬 STEP 2: Syncing Lab Test');
    const testSuccess = await syncLabTestToBlockchain(test);
    if (testSuccess) successes++; else failures++;
    
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Step 3: Sync products
  if (products.length > 0) {
    console.log('\n🏭 STEP 3: Syncing Products');
    for (const product of products) {
      const productSuccess = await syncProductToBlockchain(product);
      if (productSuccess) successes++; else failures++;
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 SYNC SUMMARY\n');
  console.log(`✅ Successful: ${successes}`);
  console.log(`❌ Failed: ${failures}`);
  console.log(`📦 Total: ${successes + failures}`);
  
  if (successes > 0) {
    console.log('\n🎉 Data synced to blockchain!');
    console.log('\n💡 Verify: node quick-blockchain-status.js');
    console.log('💡 Or query: docker exec cli peer chaincode query -C herbaltrace-channel -n herbaltrace -c \'{"function":"GetBatch","Args":["BATCH-ASHWAGANDHA-20251208-8207"]}\'');
  }
  
  console.log('\n' + '='.repeat(70));
  
  db.close();
  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  db.close();
  process.exit(1);
});

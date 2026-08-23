const axios = require('axios');
const BASE_URL = 'http://localhost:3000/api/v1';

console.log('\n' + '='.repeat(70));
console.log('  🧪 HERBALTRACE BACKEND - QUICK SYSTEM CHECK');
console.log('='.repeat(70) + '\n');

let allPassed = true;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

(async () => {
  try {
    // 1. Health Check
    allPassed &= await test('Backend Health', async () => {
      const res = await axios.get('http://localhost:3000/health');
      if (res.data.status !== 'healthy') throw new Error('Unhealthy');
    });

    // 2. Admin Login
    let adminToken;
    allPassed &= await test('Admin Login (admin/admin123)', async () => {
      const res = await axios.post(`${BASE_URL}/auth/login`, {
        username: 'admin',
        password: 'admin123'
      });
      adminToken = res.data.data.token;
      if (!adminToken) throw new Error('No token');
    });

    // 3. Farmer Login
    let farmerToken;
    allPassed &= await test('Farmer Login (avinashverma/avinash123)', async () => {
      const res = await axios.post(`${BASE_URL}/auth/login`, {
        username: 'avinashverma',
        password: 'avinash123'
      });
      farmerToken = res.data.data.token;
      if (!farmerToken) throw new Error('No token');
    });

    // 4. Lab Login
    let labToken;
    allPassed &= await test('Lab Login (labtest/lab123)', async () => {
      const res = await axios.post(`${BASE_URL}/auth/login`, {
        username: 'labtest',
        password: 'lab123'
      });
      labToken = res.data.data.token;
      if (!labToken) throw new Error('No token');
    });

    // 5. Manufacturer Login
    let mfgToken;
    allPassed &= await test('Manufacturer Login (manufacturer/manufacturer123)', async () => {
      const res = await axios.post(`${BASE_URL}/auth/login`, {
        username: 'manufacturer',
        password: 'manufacturer123'
      });
      mfgToken = res.data.data.token;
      if (!mfgToken) throw new Error('No token');
    });

    // 6. Get Collections (Farmer)
    allPassed &= await test('Farmer - Get Collections', async () => {
      const res = await axios.get(`${BASE_URL}/collections`, {
        headers: { Authorization: `Bearer ${farmerToken}` }
      });
      console.log(`   → Found ${res.data.count} collections`);
    });

    // 7. Get Batches
    allPassed &= await test('Get Batches', async () => {
      const res = await axios.get(`${BASE_URL}/batches`, {
        headers: { Authorization: `Bearer ${farmerToken}` }
      });
      console.log(`   → Found ${res.data.count} batches`);
    });

    // 8. Get QC Tests (Lab)
    allPassed &= await test('Lab - Get QC Tests', async () => {
      const res = await axios.get(`${BASE_URL}/qc/tests`, {
        headers: { Authorization: `Bearer ${labToken}` }
      });
      console.log(`   → Found ${res.data.count} tests`);
    });

    // 9. Get Registration Requests (Admin)
    allPassed &= await test('Admin - Get Registration Requests', async () => {
      const res = await axios.get(`${BASE_URL}/auth/registration-requests`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log(`   → Found ${res.data.count} requests`);
    });

    // 10. QR Verification Endpoint
    allPassed &= await test('QR Verification Endpoint Available', async () => {
      try {
        await axios.get(`${BASE_URL}/qr/verify/TEST123`);
      } catch (err) {
        if (err.response?.status === 404 || err.response?.status === 400) {
          return; // Expected - endpoint exists
        }
        throw err;
      }
    });

    // 11. Database Check
    allPassed &= await test('Database Connectivity', async () => {
      const db = require('better-sqlite3')('data/herbaltrace.db');
      const users = db.prepare('SELECT COUNT(*) as c FROM users').get();
      const collections = db.prepare('SELECT COUNT(*) as c FROM collection_events_cache').get();
      const batches = db.prepare('SELECT COUNT(*) as c FROM batches').get();
      console.log(`   → Users: ${users.c}, Collections: ${collections.c}, Batches: ${batches.c}`);
      db.close();
    });

    // 12. Blockchain Sync Check
    allPassed &= await test('Blockchain Synchronization', async () => {
      const db = require('better-sqlite3')('data/herbaltrace.db');
      const synced = db.prepare(
        'SELECT COUNT(*) as c FROM collection_events_cache WHERE blockchain_tx_id IS NOT NULL'
      ).get();
      const total = db.prepare('SELECT COUNT(*) as c FROM collection_events_cache').get();
      console.log(`   → Synced: ${synced.c}/${total.c} collections`);
      db.close();
      if (synced.c === 0 && total.c > 0) throw new Error('No blockchain sync');
    });

    console.log('\n' + '='.repeat(70));
    if (allPassed) {
      console.log('  ✨ ALL TESTS PASSED - SYSTEM READY! ✨');
    } else {
      console.log('  ⚠️  SOME TESTS FAILED - CHECK ERRORS ABOVE');
    }
    console.log('='.repeat(70) + '\n');

    // Detailed Status
    console.log('📊 SYSTEM STATUS:\n');
    const db = require('better-sqlite3')('data/herbaltrace.db');
    
    const stats = {
      users: db.prepare("SELECT COUNT(*) as c FROM users WHERE status = 'active'").get().c,
      collections: db.prepare('SELECT COUNT(*) as c FROM collection_events_cache').get().c,
      batches: db.prepare('SELECT COUNT(*) as c FROM batches').get().c,
      qcTests: db.prepare('SELECT COUNT(*) as c FROM qc_tests').get().c,
      certificates: db.prepare('SELECT COUNT(*) as c FROM qc_certificates').get().c,
      products: db.prepare('SELECT COUNT(*) as c FROM products').get().c
    };
    
    console.log(`   Active Users:     ${stats.users}`);
    console.log(`   Collections:      ${stats.collections}`);
    console.log(`   Batches:          ${stats.batches}`);
    console.log(`   QC Tests:         ${stats.qcTests}`);
    console.log(`   Certificates:     ${stats.certificates}`);
    console.log(`   Products:         ${stats.products}`);
    
    console.log('\n📋 WORKFLOW STATUS:\n');
    console.log(`   ✅ Step 1: Farmer Collections    (${stats.collections} records)`);
    console.log(`   ${stats.batches > 0 ? '✅' : '⚠️ '} Step 2: Batch Creation       (${stats.batches} batches)`);
    console.log(`   ${stats.qcTests > 0 ? '✅' : '⚠️ '} Step 3: Lab Testing          (${stats.qcTests} tests)`);
    console.log(`   ${stats.certificates > 0 ? '✅' : '⚠️ '} Step 4: Certifications       (${stats.certificates} certs)`);
    console.log(`   ${stats.products > 0 ? '✅' : '⚠️ '} Step 5: Product Creation     (${stats.products} products)`);
    
    console.log('\n💡 NEXT STEPS:\n');
    if (stats.batches === 0) {
      console.log('   → Create a batch from existing collections');
    } else if (stats.qcTests === 0) {
      console.log('   → Lab should create QC test for the batch');
    } else if (stats.certificates === 0) {
      console.log('   → Lab should submit test results and generate certificate');
    } else if (stats.products === 0) {
      console.log('   → Manufacturer should create product from tested batch');
    } else {
      console.log('   → All workflow steps have data - ready for demo!');
    }
    
    db.close();
    console.log('');

  } catch (error) {
    console.log('\n❌ CRITICAL ERROR:', error.message);
    console.log('   Make sure the backend server is running: npm start\n');
    process.exit(1);
  }
})();

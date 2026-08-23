const axios = require('axios');
const { execSync } = require('child_process');

const API = 'http://localhost:3000/api/v1';

async function login(username, password) {
  const res = await axios.post(`${API}/auth/login`, { username, password });
  return res.data.data;
}

async function main() {
  try {
    console.log('\n=== HerbalTrace Complete Live Run ===\n');

    const admin = await login('admin', 'admin123');
    const farmer = await login('avinashverma', 'avinash123');
    const lab = await login('labtest', 'lab123');
    const mfg = await login('manufacturer', 'manufacturer123');

    console.log('Logged in users: admin, farmer, lab, manufacturer');

    const today = new Date().toISOString().slice(0, 10);
    const runSalt = Date.now();
    const qty = 11 + ((runSalt % 5000) / 1000);
    const latJitter = ((runSalt % 2000) - 1000) / 10000;
    const lonJitter = (((Math.floor(runSalt / 7)) % 2000) - 1000) / 10000;
    const collectionPayload = {
      species: 'Ashwagandha',
      commonName: 'Ashwagandha',
      quantity: Number(qty.toFixed(2)),
      unit: 'kg',
      latitude: Number((28.6139 + latJitter).toFixed(6)),
      longitude: Number((77.2090 + lonJitter).toFixed(6)),
      harvestDate: today,
      harvestMethod: 'manual',
      partCollected: 'root',
      weatherConditions: 'clear',
      soilType: 'loamy'
    };

    const cRes = await axios.post(`${API}/collections`, collectionPayload, {
      headers: { Authorization: `Bearer ${farmer.token}` }
    });

    const collectionId = cRes.data.data.id;
    console.log(`Collection created: ${collectionId} (syncStatus=${cRes.data.syncStatus})`);

    let batch = null;
    if (cRes.data.autoBatch?.id) {
      batch = {
        id: cRes.data.autoBatch.id,
        batch_number: cRes.data.autoBatch.batchNumber,
        species: cRes.data.data.species,
        total_quantity: cRes.data.data.quantity
      };
      console.log(`Using auto-created batch: ${batch.batch_number} (id=${batch.id})`);
    } else {
      // Fallback path for older route behavior: sync and create batch manually.
      execSync('node sync-collections-now.js', { cwd: __dirname, stdio: 'inherit' });

      const syncedRes = await axios.get(`${API}/collections?syncStatus=synced&limit=50`, {
        headers: { Authorization: `Bearer ${admin.token}` }
      });

      const synced = syncedRes.data.data || [];
      const selected = synced.find((c) => c.id === collectionId);
      if (!selected) {
        throw new Error('Created collection was not found in synced list and no auto batch was returned.');
      }

      const batchPayload = {
        species: selected.species,
        collectionIds: [selected.id],
        notes: 'Automated complete flow run'
      };

      const bRes = await axios.post(`${API}/batches`, batchPayload, {
        headers: { Authorization: `Bearer ${admin.token}` }
      });

      batch = bRes.data.data;
      console.log(`Batch created: ${batch.batch_number} (id=${batch.id})`);
    }

    const qcPayload = {
      batch_id: String(batch.id),
      lab_id: lab.user.userId,
      lab_name: lab.user.fullName,
      test_type: 'PURITY',
      species: batch.species,
      sample_quantity: 100,
      sample_unit: 'g',
      priority: 'HIGH',
      notes: 'Complete flow run'
    };

    const qRes = await axios.post(`${API}/qc/tests`, qcPayload, {
      headers: { Authorization: `Bearer ${lab.token}` }
    });

    const testId = qRes.data.data.id;
    console.log(`QC test created: ${testId}`);

    await axios.post(`${API}/qc/tests/${testId}/results`, {
      results: [
        { parameter_name: 'Moisture', measured_value: '9.8%', measured_numeric: 9.8, unit: '%', pass_fail: 'PASS', remarks: 'Within range' },
        { parameter_name: 'Heavy Metals', measured_value: '2.0 ppm', measured_numeric: 2.0, unit: 'ppm', pass_fail: 'PASS', remarks: 'Safe' }
      ]
    }, { headers: { Authorization: `Bearer ${lab.token}` } });

    await axios.patch(`${API}/qc/tests/${testId}/status`, {
      status: 'completed',
      notes: 'Completed for product creation'
    }, { headers: { Authorization: `Bearer ${lab.token}` } });

    const certRes = await axios.post(`${API}/qc/tests/${testId}/certificate`, {}, {
      headers: { Authorization: `Bearer ${lab.token}` }
    });

    const cert = certRes.data.data;
    console.log(`Certificate generated: ${cert.certificate_number || cert.id}`);

    const productPayload = {
      batchId: batch.id,
      productName: `Premium ${batch.species} Powder`,
      productType: 'powder',
      quantity: Number(batch.total_quantity || 10),
      unit: 'kg',
      manufactureDate: today,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      ingredients: [`${batch.species} root`],
      certifications: ['Organic'],
      processingSteps: [
        { processType: 'drying', temperature: 55, duration: 4, equipment: 'Dryer' },
        { processType: 'grinding', temperature: 25, duration: 1, equipment: 'Grinder' }
      ]
    };

    const pRes = await axios.post(`${API}/manufacturer/products`, productPayload, {
      headers: { Authorization: `Bearer ${mfg.token}` }
    });

    const product = pRes.data.data;
    console.log('\n=== FINAL OUTPUT ===');
    console.log(`Product ID: ${product.id}`);
    console.log(`QR Code: ${product.qrCode}`);
    console.log(`Verification URL: ${product.verificationUrl}`);
    console.log(`Blockchain TX: ${product.blockchainTxId}`);

    const verify = await axios.get(`${API}/qr/verify/${product.qrCode}`);
    console.log(`QR verification: ${verify.data.success ? 'PASS' : 'FAIL'}`);

    if (product.qrCodeImage) {
      console.log(`QR image length: ${product.qrCodeImage.length}`);
    }

    console.log('\nComplete run finished successfully.');
  } catch (err) {
    console.error('\nComplete run failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

main();

const API = 'http://localhost:3000/api/v1';

async function jfetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, options);
  let body = null;
  try { body = await res.json(); } catch {}
  return { status: res.status, ok: res.ok, body };
}

async function login(username, password) {
  const r = await jfetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!r.ok || !r.body?.success) throw new Error(`Login failed for ${username}: ${r.status} ${r.body?.message || ''}`);
  return r.body.data;
}

(async () => {
  const out = {
    auth: {},
    registrationApproval: {},
    collectionCreate: {},
    syncRetry: {},
    batchCreate: {},
    labVerify: {},
    manufacturerQR: {},
    blockchain: {}
  };

  const admin = await login('admin', 'admin123');
  const farmer = await login('avinashverma', 'avinash123');
  const lab = await login('labtest', 'lab123');
  const manufacturer = await login('manufacturer', 'manufacturer123');

  out.auth = {
    admin: !!admin.token,
    farmer: !!farmer.token,
    lab: !!lab.token,
    manufacturer: !!manufacturer.token
  };

  const ts = Date.now();
  const newFarmerEmail = `newfarmer${ts}@herbaltrace.com`;
  const newLabEmail = `newlab${ts}@herbaltrace.com`;

  const reqFarmer = await jfetch('/auth/registration-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'New Farmer User',
      phone: '9000011111',
      email: newFarmerEmail,
      role: 'Farmer',
      locationDistrict: 'Greater Noida',
      locationState: 'Uttar Pradesh'
    })
  });

  const reqLab = await jfetch('/auth/registration-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'New Lab User',
      phone: '9000022222',
      email: newLabEmail,
      role: 'Lab',
      organizationName: 'TestingLabs'
    })
  });

  const pending = await jfetch('/auth/registration-requests?status=pending', {
    headers: { Authorization: `Bearer ${admin.token}` }
  });

  const pendingItems = pending.body?.data || [];
  const farmerReq = pendingItems.find((x) => x.email === newFarmerEmail);
  const labReq = pendingItems.find((x) => x.email === newLabEmail);

  const farmerApprove = farmerReq?.id
    ? await jfetch(`/auth/registration-requests/${farmerReq.id}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${admin.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: 'Farmer', orgName: 'Farmers' })
      })
    : null;

  const labApprove = labReq?.id
    ? await jfetch(`/auth/registration-requests/${labReq.id}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${admin.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: 'Lab', orgName: 'TestingLabs' })
      })
    : null;

  out.registrationApproval = {
    requestFarmerStatus: reqFarmer.status,
    requestLabStatus: reqLab.status,
    farmerApproved: !!farmerApprove?.body?.success,
    labApproved: !!labApprove?.body?.success
  };

  const collectionPayload = {
    species: 'Ashwagandha',
    commonName: 'Ashwagandha',
    quantity: 8.5,
    unit: 'kg',
    latitude: 28.4744,
    longitude: 77.504,
    accuracy: 5,
    harvestDate: new Date().toISOString().slice(0, 10),
    harvestMethod: 'manual',
    partCollected: 'root'
  };

  const createdCollection = await jfetch('/collections', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${farmer.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(collectionPayload)
  });

  out.collectionCreate = {
    status: createdCollection.status,
    success: !!createdCollection.body?.success,
    id: createdCollection.body?.data?.id,
    syncStatus: createdCollection.body?.syncStatus || createdCollection.body?.data?.syncStatus || null,
    txId: createdCollection.body?.transactionId || null,
    message: createdCollection.body?.message || null
  };

  const retry = await jfetch('/collections/sync/retry', {
    method: 'POST',
    headers: { Authorization: `Bearer ${admin.token}` }
  });

  out.syncRetry = {
    status: retry.status,
    success: !!retry.body?.success,
    synced: retry.body?.data?.synced || null,
    failed: retry.body?.data?.failed || null,
    total: retry.body?.data?.total || null
  };

  const allCollections = await jfetch('/collections?syncStatus=synced&limit=100', {
    headers: { Authorization: `Bearer ${admin.token}` }
  });

  const synced = allCollections.body?.data || [];
  const chosenCollection = synced[0];

  if (chosenCollection?.id && chosenCollection?.species) {
    const newBatch = await jfetch('/batches', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${admin.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        species: chosenCollection.species,
        collectionIds: [chosenCollection.id],
        notes: 'Automated verification batch'
      })
    });

    out.batchCreate = {
      status: newBatch.status,
      success: !!newBatch.body?.success,
      id: newBatch.body?.data?.id,
      batchNumber: newBatch.body?.data?.batch_number,
      message: newBatch.body?.message || null
    };

    const batchId = newBatch.body?.data?.id;
    const batchSpecies = newBatch.body?.data?.species || chosenCollection.species;

    if (batchId) {
      const qcTest = await jfetch('/qc/tests', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${lab.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          batch_id: String(batchId),
          lab_id: lab.user.userId,
          lab_name: lab.user.fullName,
          test_type: 'Moisture Content',
          species: batchSpecies,
          sample_quantity: 1,
          sample_unit: 'kg',
          priority: 'HIGH'
        })
      });

      const testId = qcTest.body?.data?.id;
      let resultRecord = null;
      let statusUpdate = null;
      let certCreate = null;

      if (testId) {
        resultRecord = await jfetch(`/qc/tests/${testId}/results`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${lab.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            results: [
              {
                parameter_name: 'Moisture',
                measured_numeric: 9.1,
                unit: '%',
                pass_fail: 'pass',
                remarks: 'Within limit'
              }
            ]
          })
        });

        statusUpdate = await jfetch(`/qc/tests/${testId}/status`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${lab.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'completed', notes: 'Completed for verification run' })
        });

        certCreate = await jfetch(`/qc/tests/${testId}/certificate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${lab.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });
      }

      out.labVerify = {
        testCreated: !!qcTest.body?.success,
        testId: testId || null,
        resultsRecorded: !!resultRecord?.body?.success,
        statusUpdated: !!statusUpdate?.body?.success,
        certificateGenerated: !!certCreate?.body?.success,
        certificateBlockchain: certCreate?.body?.data?.blockchain || null
      };

      const product = await jfetch('/manufacturer/products', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${manufacturer.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          batchId: String(batchId),
          productName: `Ashwagandha Capsules Verification Run ${Date.now()}`,
          productType: 'capsule',
          quantity: 120,
          unit: 'bottles',
          manufactureDate: new Date().toISOString().slice(0, 10),
          expiryDate: new Date(Date.now() + 31536000000).toISOString().slice(0, 10),
          ingredients: ['Ashwagandha Extract', 'Capsule Shell'],
          certifications: ['AYUSH'],
          processingSteps: [
            { processType: 'Drying', temperature: 60, duration: 120, equipment: 'Dryer' },
            { processType: 'Encapsulation', duration: 90, equipment: 'Capsule Filling Machine' }
          ]
        })
      });

      out.manufacturerQR = {
        status: product.status,
        success: !!product.body?.success,
        productId: product.body?.data?.id || null,
        qrCode: product.body?.data?.qrCode || null,
        verificationUrl: product.body?.data?.verificationUrl || null,
        blockchainTxId: product.body?.data?.blockchainTxId || null,
        message: product.body?.message || null
      };
    }
  } else {
    out.batchCreate = {
      success: false,
      message: 'No synced collection available for batch creation.'
    };
  }

  const bcHealth = await jfetch('/blockchain/health');
  const bcInfo = await jfetch('/blockchain/info', {
    headers: { Authorization: `Bearer ${admin.token}` }
  });
  const bcStats = await jfetch('/blockchain/stats', {
    headers: { Authorization: `Bearer ${admin.token}` }
  });

  out.blockchain = {
    healthStatus: bcHealth.status,
    healthy: bcHealth.body?.data?.healthy || false,
    networkStatus: bcHealth.body?.data?.status || null,
    infoStatus: bcInfo.status,
    statsStatus: bcStats.status,
    statsMessage: bcStats.body?.message || null
  };

  console.log(JSON.stringify(out, null, 2));
})();

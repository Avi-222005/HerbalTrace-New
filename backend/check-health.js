#!/usr/bin/env node
const axios = require('axios');

(async () => {
  try {
    console.log('Checking blockchain health...');
    const res = await axios.get('http://localhost:3000/api/v1/blockchain/health');
    
    console.log('\n=== HEALTH STATUS ===');
    console.log('Status:', res.data.status);
    console.log('Connected Identity:', res.data.connectedIdentity);
    console.log('Message:', res.data.message);
    
    if (res.data.status === 'UP') {
      console.log('\n✅ Blockchain connection established!');
    } else {
      console.log('\n⚠️  Blockchain status:', res.data.status);
    }
    
  } catch (error) {
    console.error('Error checking health:', error.response?.data || error.message);
    process.exit(1);
  }
})();

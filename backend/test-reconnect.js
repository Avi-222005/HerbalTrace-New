#!/usr/bin/env node
const axios = require('axios');

(async () => {
  try {
    console.log('Getting auth token...');
    const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    const token = loginRes.data.accessToken;
    console.log('✓ Token obtained');
    
    console.log('\nReconnecting to blockchain with new wallet...');
    const res = await axios.post('http://localhost:3000/api/v1/blockchain/reconnect', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✓ Reconnection response:', res.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    process.exit(1);
  }
})();

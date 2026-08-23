const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

// Test credentials
const users = {
  admin: { username: 'admin', password: 'admin123' },
  farmer: { username: 'avinashverma', password: 'avinash123' },
  lab: { username: 'labtest', password: 'lab123' },
  manufacturer: { username: 'manufacturer', password: 'manufacturer123' }
};

let tokens = {};

async function testLogin(userType) {
  console.log(`\n🔐 Testing ${userType} login...`);
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, users[userType]);
    if (response.data.success) {
      tokens[userType] = response.data.data.token;
      console.log(`✅ ${userType} login successful`);
      console.log(`   User: ${response.data.data.user.fullName} (${response.data.data.user.role})`);
      return true;
    }
  } catch (error) {
    console.log(`❌ ${userType} login failed:`, error.response?.data?.message || error.message);
    return false;
  }
}

async function testAllLogins() {
  console.log('\n='.repeat(60));
  console.log('🧪 TESTING USER AUTHENTICATION');
  console.log('='.repeat(60));

  for (const userType of Object.keys(users)) {
    await testLogin(userType);
  }

  console.log('\n='.repeat(60));
  console.log('📋 AUTHENTICATION SUMMARY');
  console.log('='.repeat(60));
  
  Object.keys(users).forEach(userType => {
    const status = tokens[userType] ? '✅ WORKING' : '❌ FAILED';
    console.log(`  ${userType.padEnd(15)} | ${users[userType].username.padEnd(20)} | ${status}`);
  });

  console.log('\n✨ Authentication testing complete!\n');
}

// Run the test
testAllLogins().catch(console.error);

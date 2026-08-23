const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000/api/v1';
let tokens = {};
let testData = {};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.cyan);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(`  ${title}`, colors.bright + colors.cyan);
  console.log('='.repeat(70) + '\n');
}

// Test 1: Backend Health Check
async function testHealthCheck() {
  logSection('TEST 1: Backend Health Check');
  try {
    const response = await axios.get(`${BASE_URL.replace('/api/v1', '')}/health`);
    if (response.data.status === 'healthy') {
      logSuccess('Backend server is healthy');
      logInfo(`  Database: ${response.data.database}`);
      logInfo(`  Blockchain: ${response.data.blockchain}`);
      return true;
    }
  } catch (error) {
    logError('Backend health check failed');
    logError(`  ${error.message}`);
    return false;
  }
}

// Test 2: User Authentication
async function testAuthentication() {
  logSection('TEST 2: User Authentication');
  
  const users = {
    admin: { username: 'admin', password: 'admin123', expectedRole: 'Admin' },
    farmer: { username: 'avinashverma', password: 'avinash123', expectedRole: 'Farmer' },
    lab: { username: 'labtest', password: 'lab123', expectedRole: 'Lab' },
    manufacturer: { username: 'manufacturer', password: 'manufacturer123', expectedRole: 'Manufacturer' }
  };

  let allPassed = true;

  for (const [userType, credentials] of Object.entries(users)) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        username: credentials.username,
        password: credentials.password
      });

      if (response.data.success) {
        tokens[userType] = response.data.data.token;
        const user = response.data.data.user;
        
        if (user.role === credentials.expectedRole) {
          logSuccess(`${userType.toUpperCase()} login successful`);
          logInfo(`  Username: ${user.username}`);
          logInfo(`  Role: ${user.role}`);
          logInfo(`  Organization: ${user.orgName}`);
        } else {
          logWarning(`${userType.toUpperCase()} role mismatch: expected ${credentials.expectedRole}, got ${user.role}`);
          allPassed = false;
        }
      }
    } catch (error) {
      logError(`${userType.toUpperCase()} login failed`);
      logError(`  ${error.response?.data?.message || error.message}`);
      allPassed = false;
    }
  }

  return allPassed;
}

// Test 3: Database Connectivity
async function testDatabaseData() {
  logSection('TEST 3: Database Data Check');
  
  try {
    const db = require('better-sqlite3')('data/herbaltrace.db');
    
    // Check users
    const users = db.prepare('SELECT COUNT(*) as count FROM users WHERE status = ?').get('active');
    logSuccess(`Active users: ${users.count}`);
    
    // Check collections
    const collections = db.prepare('SELECT COUNT(*) as count FROM collection_events_cache').get();
    logSuccess(`Collection events: ${collections.count}`);
    
    // Check batches
    const batches = db.prepare('SELECT COUNT(*) as count FROM batches').get();
    logSuccess(`Batches: ${batches.count}`);
    
    // Get a test batch if exists
    const testBatch = db.prepare('SELECT id, batch_number, species, status FROM batches LIMIT 1').get();
    if (testBatch) {
      testData.batchId = testBatch.id;
      logInfo(`  Test Batch ID: ${testBatch.batch_number}`);
      logInfo(`  Species: ${testBatch.species}`);
      logInfo(`  Status: ${testBatch.status}`);
    }
    
    db.close();
    return true;
  } catch (error) {
    logError('Database check failed');
    logError(`  ${error.message}`);
    return false;
  }
}

// Test 4: Farmer Endpoints
async function testFarmerEndpoints() {
  logSection('TEST 4: Farmer Endpoints');
  
  if (!tokens.farmer) {
    logError('Farmer token not available, skipping');
    return false;
  }

  try {
    // Get collections
    const collectionsResponse = await axios.get(`${BASE_URL}/collections`, {
      headers: { Authorization: `Bearer ${tokens.farmer}` }
    });
    
    logSuccess(`Retrieved ${collectionsResponse.data.count} collections`);
    
    // Get batches
    const batchesResponse = await axios.get(`${BASE_URL}/batches`, {
      headers: { Authorization: `Bearer ${tokens.farmer}` }
    });
    
    logSuccess(`Retrieved ${batchesResponse.data.count} batches`);
    
    return true;
  } catch (error) {
    logError('Farmer endpoints test failed');
    logError(`  ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 5: Lab Endpoints
async function testLabEndpoints() {
  logSection('TEST 5: Lab Endpoints');
  
  if (!tokens.lab) {
    logError('Lab token not available, skipping');
    return false;
  }

  try {
    // Get QC tests
    const testsResponse = await axios.get(`${BASE_URL}/qc/tests`, {
      headers: { Authorization: `Bearer ${tokens.lab}` }
    });
    
    logSuccess(`Retrieved ${testsResponse.data.count} QC tests`);
    
    // Check certificates in database
    const db = require('better-sqlite3')('data/herbaltrace.db');
    const certsCount = db.prepare('SELECT COUNT(*) as count FROM qc_certificates').get();
    db.close();
    
    logSuccess(`Certificates in database: ${certsCount.count}`);
    
    return true;
  } catch (error) {
    logError('Lab endpoints test failed');
    logError(`  ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 6: Manufacturer Endpoints
async function testManufacturerEndpoints() {
  logSection('TEST 6: Manufacturer Endpoints');
  
  if (!tokens.manufacturer) {
    logError('Manufacturer token not available, skipping');
    return false;
  }

  try {
    // Get batches ready for manufacturing
    const batchesResponse = await axios.get(`${BASE_URL}/batches?status=quality_tested`, {
      headers: { Authorization: `Bearer ${tokens.manufacturer}` }
    });
    
    logSuccess(`Found ${batchesResponse.data.count} batches ready for manufacturing`);
    
    // Get products (if any)
    try {
      const productsResponse = await axios.get(`${BASE_URL}/manufacturer/products`, {
        headers: { Authorization: `Bearer ${tokens.manufacturer}` }
      });
      logSuccess(`Retrieved ${productsResponse.data.count || 0} products`);
    } catch (err) {
      logInfo('  No products endpoint or no products yet');
    }
    
    return true;
  } catch (error) {
    logError('Manufacturer endpoints test failed');
    logError(`  ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 7: Admin Endpoints
async function testAdminEndpoints() {
  logSection('TEST 7: Admin Endpoints');
  
  if (!tokens.admin) {
    logError('Admin token not available, skipping');
    return false;
  }

  try {
    // Get registration requests
    const requestsResponse = await axios.get(`${BASE_URL}/auth/registration-requests`, {
      headers: { Authorization: `Bearer ${tokens.admin}` }
    });
    
    logSuccess(`Retrieved ${requestsResponse.data.count} registration requests`);
    
    // Get all users
    try {
      const usersResponse = await axios.get(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${tokens.admin}` }
      });
      logSuccess(`Retrieved ${usersResponse.data.count || 0} users`);
    } catch (err) {
      logInfo('  Users endpoint not available or restricted');
    }
    
    return true;
  } catch (error) {
    logError('Admin endpoints test failed');
    logError(`  ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 8: Blockchain Integration
async function testBlockchainIntegration() {
  logSection('TEST 8: Blockchain Integration Check');
  
  try {
    const db = require('better-sqlite3')('data/herbaltrace.db');
    
    // Check collections with blockchain_tx_id
    const syncedCollections = db.prepare(
      'SELECT COUNT(*) as count FROM collection_events_cache WHERE blockchain_tx_id IS NOT NULL'
    ).get();
    
    const totalCollections = db.prepare(
      'SELECT COUNT(*) as count FROM collection_events_cache'
    ).get();
    
    if (syncedCollections.count > 0) {
      logSuccess(`Blockchain synced collections: ${syncedCollections.count}/${totalCollections.count}`);
    } else {
      logWarning(`No collections synced to blockchain yet`);
    }
    
    // Check sample blockchain transaction
    const sampleTx = db.prepare(
      'SELECT id, blockchain_tx_id FROM collection_events_cache WHERE blockchain_tx_id IS NOT NULL LIMIT 1'
    ).get();
    
    if (sampleTx) {
      logInfo(`  Sample TX ID: ${sampleTx.blockchain_tx_id.substring(0, 20)}...`);
    }
    
    db.close();
    return true;
  } catch (error) {
    logError('Blockchain integration check failed');
    logError(`  ${error.message}`);
    return false;
  }
}

// Test 9: QR Code Endpoints
async function testQREndpoints() {
  logSection('TEST 9: QR Code Endpoints (Public)');
  
  try {
    // Test with a dummy QR code to check endpoint availability
    const testQR = 'TEST-QR-CODE-123';
    
    try {
      await axios.get(`${BASE_URL}/qr/verify/${testQR}`);
    } catch (error) {
      if (error.response?.status === 404) {
        logSuccess('QR verification endpoint is accessible (returned 404 for test QR)');
        logInfo('  Endpoint ready for valid QR codes');
        return true;
      } else if (error.response?.status === 400) {
        logSuccess('QR verification endpoint is accessible (returned 400 for invalid format)');
        return true;
      } else {
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    logError('QR endpoints test failed');
    logError(`  ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 10: Create Complete Workflow (if data exists)
async function testCompleteWorkflow() {
  logSection('TEST 10: End-to-End Workflow Readiness');
  
  const db = require('better-sqlite3')('data/herbaltrace.db');
  
  try {
    // Check workflow stages
    const collections = db.prepare('SELECT COUNT(*) as count FROM collection_events_cache').get();
    const batches = db.prepare('SELECT COUNT(*) as count FROM batches').get();
    const tests = db.prepare('SELECT COUNT(*) as count FROM qc_tests').get();
    const certificates = db.prepare('SELECT COUNT(*) as count FROM qc_certificates').get();
    const products = db.prepare('SELECT COUNT(*) as count FROM products').get();
    
    logInfo('Workflow Stage Data:');
    logInfo(`  1. Collections:  ${collections.count} ✅`);
    logInfo(`  2. Batches:      ${batches.count} ${batches.count > 0 ? '✅' : '⚠️'}`);
    logInfo(`  3. QC Tests:     ${tests.count} ${tests.count > 0 ? '✅' : '⚠️'}`);
    logInfo(`  4. Certificates: ${certificates.count} ${certificates.count > 0 ? '✅' : '⚠️'}`);
    logInfo(`  5. Products:     ${products.count} ${products.count > 0 ? '✅' : '⚠️'}`);
    
    if (batches.count > 0) {
      logSuccess('System has data ready for testing complete workflow');
    } else {
      logWarning('System needs batch creation to test complete workflow');
    }
    
    db.close();
    return true;
  } catch (error) {
    logError('Workflow readiness check failed');
    logError(`  ${error.message}`);
    db.close();
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n');
  log('╔══════════════════════════════════════════════════════════════════════╗', colors.bright);
  log('║                                                                      ║', colors.bright);
  log('║     🌿 HERBALTRACE BACKEND - COMPREHENSIVE TEST SUITE 🧪            ║', colors.bright);
  log('║                                                                      ║', colors.bright);
  log('╚══════════════════════════════════════════════════════════════════════╝', colors.bright);
  
  const results = {};
  
  // Run all tests
  results.health = await testHealthCheck();
  results.auth = await testAuthentication();
  results.database = await testDatabaseData();
  results.farmer = await testFarmerEndpoints();
  results.lab = await testLabEndpoints();
  results.manufacturer = await testManufacturerEndpoints();
  results.admin = await testAdminEndpoints();
  results.blockchain = await testBlockchainIntegration();
  results.qr = await testQREndpoints();
  results.workflow = await testCompleteWorkflow();
  
  // Summary
  logSection('TEST SUMMARY');
  
  const tests = [
    { name: 'Backend Health Check', key: 'health' },
    { name: 'User Authentication', key: 'auth' },
    { name: 'Database Connectivity', key: 'database' },
    { name: 'Farmer Endpoints', key: 'farmer' },
    { name: 'Lab Endpoints', key: 'lab' },
    { name: 'Manufacturer Endpoints', key: 'manufacturer' },
    { name: 'Admin Endpoints', key: 'admin' },
    { name: 'Blockchain Integration', key: 'blockchain' },
    { name: 'QR Code Endpoints', key: 'qr' },
    { name: 'Workflow Readiness', key: 'workflow' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    const status = results[test.key];
    if (status) {
      logSuccess(`${test.name.padEnd(30)} PASSED`);
      passed++;
    } else {
      logError(`${test.name.padEnd(30)} FAILED`);
      failed++;
    }
  });
  
  console.log('\n' + '='.repeat(70));
  log(`\n  Total Tests: ${tests.length}`, colors.bright);
  log(`  Passed: ${passed}`, colors.green);
  if (failed > 0) {
    log(`  Failed: ${failed}`, colors.red);
  }
  
  const percentage = Math.round((passed / tests.length) * 100);
  console.log('');
  
  if (percentage === 100) {
    log('  ✨ ALL TESTS PASSED! SYSTEM READY FOR PRODUCTION! ✨', colors.bright + colors.green);
  } else if (percentage >= 80) {
    log('  ✅ SYSTEM MOSTLY FUNCTIONAL - READY FOR DEMO', colors.green);
  } else if (percentage >= 60) {
    log('  ⚠️  SOME ISSUES DETECTED - NEEDS ATTENTION', colors.yellow);
  } else {
    log('  ❌ CRITICAL ISSUES - SYSTEM NOT READY', colors.red);
  }
  
  console.log('\n' + '='.repeat(70) + '\n');
  
  // Save test report
  const report = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: tests.length,
      passed,
      failed,
      percentage
    },
    tokens: Object.keys(tokens)
  };
  
  fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
  logInfo('Test report saved to test-report.json');
  
  console.log('');
}

// Check if server is running
async function checkServerRunning() {
  try {
    await axios.get(`${BASE_URL.replace('/api/v1', '')}/health`, { timeout: 2000 });
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
(async () => {
  const isRunning = await checkServerRunning();
  
  if (!isRunning) {
    logError('\n❌ Backend server is not running!');
    logInfo('Please start the server first:');
    logInfo('  cd backend && npm start\n');
    process.exit(1);
  }
  
  await runAllTests();
})();

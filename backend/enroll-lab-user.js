// Enroll lab user identity for blockchain access
const path = require('path');
const { enrollUserWithAdminCert } = require('./dist/utils/enrollUser');

async function enrollLabUser() {
  console.log('\n🔐 ENROLLING LAB USER FOR BLOCKCHAIN ACCESS\n');
  console.log('='.repeat(60));
  
  // The lab user ID that's failing
  const labUserId = 'lab-1765099544540-5h9e';
  const organization = 'TestingLabs';
  const affiliation = 'lab';
  
  console.log(`\n📋 User Details:`);
  console.log(`   User ID: ${labUserId}`);
  console.log(`   Organization: ${organization}`);
  console.log(`   Affiliation: ${affiliation}`);
  console.log(`\n🔄 Starting enrollment process...`);
  
  try {
    const success = await enrollUserWithAdminCert(labUserId, organization, affiliation);
    
    if (success) {
      console.log('\n✅ SUCCESS! Lab user enrolled in blockchain network');
      console.log('\n📝 Next steps:');
      console.log('   1. Run: node sync-pending-tests.js');
      console.log('   2. Check results with: node check-batch-sync.js');
      console.log('\n   The auto-sync scheduler will also pick this up automatically.');
    } else {
      console.log('\n❌ FAILED to enroll lab user');
      console.log('\n🔍 Troubleshooting:');
      console.log('   1. Check if network/organizations/peerOrganizations/labs.herbaltrace.com exists');
      console.log('   2. Verify admin certificates are present');
      console.log('   3. Check backend logs for detailed error messages');
    }
  } catch (error) {
    console.error('\n❌ ERROR during enrollment:', error.message);
    console.error('\nFull error:', error);
  }
  
  console.log('\n' + '='.repeat(60));
}

enrollLabUser();

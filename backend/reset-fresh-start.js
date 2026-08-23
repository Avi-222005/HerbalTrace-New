const path = require('path');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'data', 'herbaltrace.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

const baseUsers = [
  {
    id: 'admin-001',
    userId: 'admin-001',
    username: 'admin',
    email: 'admin@herbaltrace.com',
    password: 'admin@123',
    fullName: 'System Administrator',
    role: 'Admin',
    orgName: 'HerbalTrace',
    orgMsp: 'HerbalTraceMSP',
    affiliation: 'admin.department1'
  },
  {
    id: 'farmer-001',
    userId: 'farmer-001',
    username: 'avinashverma',
    email: 'avinash@herbaltrace.com',
    password: 'avinash123',
    fullName: 'Avinash Verma',
    role: 'Farmer',
    orgName: 'Farmers',
    orgMsp: 'FarmersCoopMSP',
    affiliation: 'farmers.department1'
  },
  {
    id: 'lab-001',
    userId: 'lab-001',
    username: 'labtest',
    email: 'lab@herbaltrace.com',
    password: 'lab123',
    fullName: 'Lab Test User',
    role: 'Lab',
    orgName: 'TestingLabs',
    orgMsp: 'TestingLabsMSP',
    affiliation: 'testinglabs.department1'
  },
  {
    id: 'manufacturer-001',
    userId: 'manufacturer-001',
    username: 'manufacturer',
    email: 'manufacturer@herbaltrace.com',
    password: 'manufacturer123',
    fullName: 'HerbalTrace Manufacturer',
    role: 'Manufacturer',
    orgName: 'Manufacturers',
    orgMsp: 'ManufacturersMSP',
    affiliation: 'manufacturers.department1'
  }
];

const clearStatements = [
  'DELETE FROM dashboard_cache',
  'DELETE FROM scheduled_reports',
  'DELETE FROM analytics_reports',
  'DELETE FROM analytics_metrics',
  'DELETE FROM qc_results',
  'DELETE FROM qc_test_parameters',
  'DELETE FROM qc_certificates',
  'DELETE FROM qc_tests',
  'DELETE FROM qc_test_templates',
  'DELETE FROM products',
  'DELETE FROM recall_records',
  'DELETE FROM alerts',
  'DELETE FROM processing_steps_cache',
  'DELETE FROM quality_tests_cache',
  'DELETE FROM batch_collections',
  'DELETE FROM batches',
  'DELETE FROM collection_events_cache',
  'DELETE FROM registration_requests',
  'DELETE FROM users'
];

try {
  console.log('Resetting HerbalTrace data for fresh start...');

  db.exec('BEGIN');

  for (const sql of clearStatements) {
    try {
      db.prepare(sql).run();
    } catch (err) {
      // Ignore table-specific issues to keep reset resilient on partial schemas.
    }
  }

  const insertUser = db.prepare(`
    INSERT INTO users (
      id, user_id, username, email, password_hash, full_name, role,
      org_name, org_msp, affiliation, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', datetime('now'), datetime('now'))
  `);

  for (const user of baseUsers) {
    insertUser.run(
      user.id,
      user.userId,
      user.username,
      user.email,
      bcrypt.hashSync(user.password, 10),
      user.fullName,
      user.role,
      user.orgName,
      user.orgMsp,
      user.affiliation
    );
  }

  db.exec('COMMIT');

  console.log('Fresh start reset complete.');
  console.log('Active credentials:');
  console.log('  admin / admin@123');
  console.log('  avinashverma / avinash123');
  console.log('  labtest / lab123');
  console.log('  manufacturer / manufacturer123');
} catch (error) {
  db.exec('ROLLBACK');
  console.error('Fresh start reset failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}

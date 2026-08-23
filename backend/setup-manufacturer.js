const bcrypt = require('bcryptjs');
const db = require('better-sqlite3')('data/herbaltrace.db');
const { v4: uuidv4 } = require('uuid');

console.log('\n🏭 Checking/Creating Manufacturer User\n');

// Check if manufacturer user exists
const manufacturer = db.prepare('SELECT * FROM users WHERE role = ? AND status = ?').get('Manufacturer', 'active');

if (!manufacturer) {
  console.log('❌ No active Manufacturer user found. Creating one...\n');
  
  const manufacturerId = `manufacturer-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const passwordHash = bcrypt.hashSync('manufacturer123', 10);
  
  db.prepare(`
    INSERT INTO users (
      id, user_id, username, email, password_hash, full_name, phone, role,
      org_name, org_msp, affiliation, status, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    uuidv4(),
    manufacturerId,
    'manufacturer',
    'manufacturer@herbaltrace.com',
    passwordHash,
    'HerbalTrace Manufacturer',
    '9999999999',
    'Manufacturer',
    'Manufacturers',
    'ManufacturersMSP',
    'manufacturers.department1',
    'active',
    'admin-001'
  );
  
  console.log('✅ Manufacturer user created!');
  console.log(`   Username: manufacturer`);
  console.log(`   Password: manufacturer123`);
  console.log(`   User ID: ${manufacturerId}`);
} else {
  console.log('✅ Manufacturer user already exists:');
  console.log(`   Username: ${manufacturer.username}`);
  console.log(`   User ID: ${manufacturer.user_id}`);
  console.log(`   Name: ${manufacturer.full_name}`);
  
  // Update password to manufacturer123 if needed
  const testPassword = 'manufacturer123';
  const isMatch = bcrypt.compareSync(testPassword, manufacturer.password_hash);
  
  if (!isMatch) {
    console.log('\n🔄 Updating manufacturer password to: manufacturer123');
    const passwordHash = bcrypt.hashSync(testPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE user_id = ?').run(passwordHash, manufacturer.user_id);
    console.log('✅ Password updated!');
  } else {
    console.log('✅ Password already set correctly');
  }
}

console.log('\n📋 All System Users:\n');

const allUsers = db.prepare(`
  SELECT user_id, username, full_name, role, org_name, status 
  FROM users 
  WHERE status = 'active'
  ORDER BY 
    CASE role 
      WHEN 'Admin' THEN 1 
      WHEN 'Farmer' THEN 2 
      WHEN 'Lab' THEN 3 
      WHEN 'Manufacturer' THEN 4 
      ELSE 5 
    END,
    username
`).all();

const knownPasswords = {
  'admin': 'admin123',
  'avinashverma': 'avinash123',
  'labtest': 'lab123',
  'manufacturer': 'manufacturer123'
};

allUsers.forEach(user => {
  const pwd = knownPasswords[user.username] || '(unknown)';
  console.log(`  ${user.role.padEnd(12)} | ${user.username.padEnd(20)} | ${user.full_name.padEnd(30)} | pwd: ${pwd}`);
});

console.log('\n');

db.close();

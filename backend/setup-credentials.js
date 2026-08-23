const bcrypt = require('bcryptjs');
const db = require('better-sqlite3')('data/herbaltrace.db');

console.log('\n🔐 Setting Up User Credentials\n');

// Define the correct credentials
const userCredentials = {
  'admin': 'admin@123',         // Admin user
  'avinashverma': 'avinash123',  // Farmer user
  'labtest': 'lab123'            // Lab user - already correct
};

// Update passwords
Object.entries(userCredentials).forEach(([username, password]) => {
  const user = db.prepare('SELECT id, user_id, username, role FROM users WHERE username = ?').get(username);
  
  if (user) {
    const passwordHash = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE username = ?').run(passwordHash, username);
    console.log(`✅ Updated ${user.role} user: ${username} -> password: ${password}`);
  } else {
    console.log(`❌ User not found: ${username}`);
  }
});

console.log('\n📋 Current Active Users:\n');

const allUsers = db.prepare(`
  SELECT user_id, username, full_name, email, role, org_name, status 
  FROM users 
  WHERE status = 'active'
  ORDER BY role, username
`).all();

allUsers.forEach(user => {
  const pwd = userCredentials[user.username] || '(not set in script)';
  console.log(`  ${user.role.padEnd(12)} | ${user.username.padEnd(20)} | Password: ${pwd}`);
});

console.log('\n✅ Credentials setup complete!\n');
console.log('📝 Summary:');
console.log('  - Admin:  username: admin         password: admin@123');
console.log('  - Farmer: username: avinashverma  password: avinash123');
console.log('  - Lab:    username: labtest       password: lab123');
console.log('\n');

db.close();

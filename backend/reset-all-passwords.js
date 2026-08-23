const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const db = new Database('./data/herbaltrace.db');

console.log('\n🔑 Resetting All User Passwords...\n');
console.log('='.repeat(60));

const users = db.prepare('SELECT id, username, role FROM users').all();

users.forEach(user => {
  const password = `${user.username}123`;
  const hash = bcrypt.hashSync(password, 10);
  
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);
  
  console.log(`\n✓ ${user.role.toUpperCase()}: ${user.username}`);
  console.log(`  Password: ${password}`);
});

console.log('\n' + '='.repeat(60));
console.log('\n✅ All passwords reset successfully!');
console.log('💡 Password pattern: <username>123\n');

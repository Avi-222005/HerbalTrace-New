const Database = require('better-sqlite3');
const db = new Database('./data/herbaltrace.db');

console.log('\n' + '='.repeat(70));
console.log('🔐 HERBALTRACE - ALL USER ACCOUNTS');
console.log('='.repeat(70) + '\n');

const users = db.prepare('SELECT id, username, role, full_name, email, phone, org_name, created_at FROM users ORDER BY role').all();

const roleOrder = ['Admin', 'Farmer', 'Lab', 'Processor', 'Manufacturer', 'Regulator'];

roleOrder.forEach(roleFilter => {
  const roleUsers = users.filter(u => u.role === roleFilter);
  if (roleUsers.length > 0) {
    console.log(`\n📋 ${roleFilter.toUpperCase()} ACCOUNTS (${roleUsers.length}):`);
    console.log('-'.repeat(70));
    roleUsers.forEach((u, idx) => {
      console.log(`\n${idx + 1}. Username: ${u.username}`);
      console.log(`   Password: ${u.username}123`);
      console.log(`   Name: ${u.full_name}`);
      console.log(`   Email: ${u.email}`);
      console.log(`   Phone: ${u.phone || 'N/A'}`);
      console.log(`   Organization: ${u.org_name || 'N/A'}`);
      console.log(`   Role: ${u.role}`);
      console.log(`   Created: ${new Date(u.created_at).toLocaleDateString()}`);
    });
  }
});

console.log('\n' + '='.repeat(70));
console.log('\n💡 DEFAULT PASSWORD PATTERN: <username>123');
console.log('   Example: farmer -> farmer123, lab -> lab123\n');
console.log('='.repeat(70) + '\n');

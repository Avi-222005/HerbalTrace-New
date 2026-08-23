const bcrypt = require('bcryptjs');
const db = require('better-sqlite3')('data/herbaltrace.db');

console.log('\n=== User Credentials Check ===\n');

const users = db.prepare('SELECT username, password_hash FROM users').all();

const testPasswords = {
  'admin': ['admin@123', 'admin123', 'admin'],
  'avinashverma': ['avinashverma', 'avinash123', 'password'],
  'labtest': ['lab123', 'labtest', 'labtest123'],
  'kunaldubey1810': ['kunaldubey1810', 'kunal123']
};

users.forEach(user => {
  console.log(`\n👤 Username: ${user.username}`);
  
  const passwordsToTest = testPasswords[user.username] || [user.username, user.username + '123'];
  
  passwordsToTest.forEach(pwd => {
    const isMatch = bcrypt.compareSync(pwd, user.password_hash);
    console.log(`  ${isMatch ? '✅' : '❌'} Password: "${pwd}"`);
  });
});

db.close();
console.log('\n');

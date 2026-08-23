const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'herbaltrace.db');
const db = new Database(dbPath);

const username = 'shreyasrivastav';
const newPassword = 'shreyasrivastav123';

// Hash the new password
const passwordHash = bcrypt.hashSync(newPassword, 10);

// Update the user's password
const result = db.prepare(`
  UPDATE users 
  SET password_hash = ? 
  WHERE username = ?
`).run(passwordHash, username);

if (result.changes > 0) {
  console.log(`✅ Password updated successfully for user: ${username}`);
  console.log(`   New password: ${newPassword}`);
} else {
  console.log(`❌ User not found: ${username}`);
}

db.close();

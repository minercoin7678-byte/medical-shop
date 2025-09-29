const bcrypt = require('bcrypt');

const password = 'admin123'; // ← رمز دلخواهت (تغییرش بده اگر خواستی)
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('✅ Hashed password:');
    console.log(hash);
    console.log('\n📌 Copy this hash and use it in your SQL INSERT.');
  }
});
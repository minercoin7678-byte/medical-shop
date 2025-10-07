const bcrypt = require('bcrypt');

const password = 'password123'; // رمز عبور واقعی
const hash = '$2b$10$WEeJzb9aPuCN/vMq.8R.xeAPWYXjd3ARbCyNVrENpuRzuXr6iAqSy'; // هشی که می‌خوای تست کنی

bcrypt.compare(password, hash, (err, isMatch) => {
  if (err) {
    console.error('Error:', err);
  } else {
    if (isMatch) {
      console.log('✅ رمز عبور و هش مطابقت دارن!');
    } else {
      console.log('❌ رمز عبور و هش مطابقت ندارن!');
    }
  }
});
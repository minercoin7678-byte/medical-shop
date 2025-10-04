const db = require('./db');

db.query('SELECT current_database();')
  .then(res => {
    console.log('✅ دیتابیس فعال:', res.rows[0].current_database);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ خطا:', err.message);
    process.exit(1);
  });
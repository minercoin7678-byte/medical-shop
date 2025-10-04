// db.js
const { Pool } = require('pg');
require('dotenv').config();

// تنظیمات اتصال با SSL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false // فقط برای Render — امن است
  }
});

// تست اتصال
// تست اتصال + نمایش اطلاعات دیتابیس
pool.query('SELECT current_database(), current_user;', (err, res) => {
  if (err) {
    console.error('❌ دیتابیس وصل نشد:', err.stack);
  } else {
    const dbName = res.rows[0].current_database;
    const dbUser = res.rows[0].current_user;
    console.log(`✅ دیتابیس "${dbName}" با کاربر "${dbUser}" وصل شد!`);
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
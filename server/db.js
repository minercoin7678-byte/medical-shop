// db.js
const { Pool } = require('pg');
require('dotenv').config();

// چک کردن متغیرهای محیطی
if (!process.env.DB_HOST || !process.env.DB_PORT || !process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASSWORD) {
  console.error('❌ متغیرهای محیطی دیتابیس تعریف نشدن!');
  console.error('لطفاً این متغیرها رو در .env یا Render تعریف کن:');
  console.error('- DB_HOST');
  console.error('- DB_PORT');
  console.error('- DB_NAME');
  console.error('- DB_USER');
  console.error('- DB_PASSWORD');
  process.exit(1);
}

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
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ دیتابیس وصل نشد:', err.stack);
  } else {
    console.log('✅ دیتابیس با موفقیت وصل شد!');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
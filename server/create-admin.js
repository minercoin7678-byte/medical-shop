const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function createAdmin() {
  const email = 'admin@medicalshop.com';
  const password = 'admin123'; // ← رمز عبور ادمین (می‌تونی عوضش کنی)
  const name = 'مدیر سایت';

  try {
    // هَش کردن رمز عبور
    const hashedPassword = await bcrypt.hash(password, 10);

    // ساخت کاربر ادمین
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4) RETURNING id, email`,
      [name, email, hashedPassword, 'admin']
    );

    console.log('✅ ادمین با موفقیت ساخته شد!');
    console.log('📧 ایمیل:', email);
    console.log('🔑 رمز عبور:', password);
  } catch (err) {
    console.error('❌ خطا:', err.message);
  } finally {
    await pool.end();
  }
}

createAdmin();
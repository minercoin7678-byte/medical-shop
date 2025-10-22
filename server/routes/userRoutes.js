const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();
const { Resend } = require('resend');

// Middleware برای احراز هویت
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

// POST /api/register
router.post('/register', async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (name, email, password, phone, address)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role`,
      [name, email, hashedPassword, phone, address]
    );

    res.status(201).json({
      message: 'User registered successfully!',
      user: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User not found.' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password.' });
    }

    // ✅ تنظیم مدت اعتبار بر اساس نقش کاربر
    const expiresIn = user.role === 'admin' ? '2h' : '24h';

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful!',
      token: token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// GET /api/dashboard → فقط برای کاربران واردشده
router.get('/dashboard', authenticateToken, (req, res) => {
  res.json({
    message: 'Welcome to your dashboard!',
    user: req.user
  });
});
// اضافه کردن Resend در بالای فایل (بعد از سایر importها)
const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/forgot-password → درخواست بازیابی رمز عبور
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  try {
    // یافتن کاربر
    const userResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      // برای امنیت، همیشه پیام موفقیت بده
      return res.json({ message: 'اگر ایمیل معتبر باشد، لینک بازیابی ارسال می‌شود.' });
    }

    const userId = userResult.rows[0].id;
    
    // تولید توکن یک‌بارمصرف (10 دقیقه معتبر)
    const resetToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '10m' });
    
    // ذخیره توکن در دیتابیس
    await db.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = NOW() + INTERVAL \'10 minutes\' WHERE id = $2',
      [resetToken, userId]
    );

    // ارسال ایمیل
    const { error } = await resend.emails.send({
      from: 'بازیابی رمز عبور <noreply@medicalshop.com>',
      to: [email],
      subject: 'درخواست بازیابی رمز عبور',
      html: `
        <p>درخواست بازیابی رمز عبور برای ایمیل ${email} دریافت شد.</p>
        <p>برای تغییر رمز عبور، روی لینک زیر کلیک کنید:</p>
        <a href="https://medical-shop-alpha.vercel.app//#/reset-password/${resetToken}" 
           style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          بازیابی رمز عبور
        </a>
        <p>این لینک تا ۱۰ دقیقه معتبر است.</p>
        <p>اگر شما این درخواست را ارسال نکرده‌اید، این ایمیل را نادیده بگیرید.</p>
      `
    });

    if (error) {
      console.error('ایمیل ارسال نشد:', error);
      // همچنان پیام موفقیت بده تا امنیت حفظ بشه
    }

    res.json({ message: 'اگر ایمیل معتبر باشد، لینک بازیابی ارسال می‌شود.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'خطایی رخ داد. لطفاً دوباره تلاش کنید.' });
  }
});

// POST /api/reset-password → تغییر رمز عبور
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  
  try {
    // تأیید توکن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // بررسی انقضا و اعتبار توکن در دیتابیس
    const userResult = await db.query(
      'SELECT id FROM users WHERE id = $1 AND reset_token = $2 AND reset_token_expires > NOW()',
      [decoded.id, token]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'توکن نامعتبر یا منقضی شده است.' });
    }

    // هش رمز عبور جدید
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // ذخیره رمز جدید و پاک کردن توکن
    await db.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hashedPassword, decoded.id]
    );
    
    res.json({ message: 'رمز عبور با موفقیت تغییر کرد.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(400).json({ error: 'توکن نامعتبر است.' });
  }
});

module.exports = router;
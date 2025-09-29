const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // ⚠️ این رو بالا اضافه کن
const db = require('../db');
const router = express.Router();

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

    // ایجاد توکن
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
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

// ⚠️ این خط حتماً آخر فایل باشه
module.exports = router;
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

// Middleware احراز هویت
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

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

// POST /api/orders → ثبت سفارش جدید
router.post('/', authenticateToken, async (req, res) => {
  const { shipping_address, phone } = req.body;
  const user_id = req.user.id;

  // اعتبارسنجی ورودی
  if (!shipping_address || !phone) {
    return res.status(400).json({ error: 'Shipping address and phone are required.' });
  }

  try {
    // 1. گرفتن آیتم‌های سبد خرید از جدول `cart` (نه cart_items!)
    const cartItems = await db.query(
      `SELECT c.product_id, c.quantity, p.name, p.price
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1`,
      [user_id]
    );

    if (cartItems.rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty.' });
    }

    // 2. محاسبه قیمت کل
    const total_amount = cartItems.rows.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 3. شروع تراکنش
    await db.query('BEGIN');

    // 4. ساخت سفارش جدید
    const orderResult = await db.query(
      `INSERT INTO orders (user_id, total_amount, shipping_address, phone, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING id`,
      [user_id, total_amount, shipping_address, phone]
    );
    const orderId = orderResult.rows[0].id;

    // 5. اضافه کردن آیتم‌ها به order_items
    for (const item of cartItems.rows) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price_per_unit)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.product_id, item.name, item.quantity, item.price]
      );
    }

    // 6. پاک کردن سبد خرید
    await db.query('DELETE FROM cart WHERE user_id = $1', [user_id]);

    // 7. تکمیل تراکنش
    await db.query('COMMIT');

    res.status(201).json({
      message: 'Order placed successfully!',
      orderId,
      total_amount
    });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to place order.' });
  }
});

// GET /api/orders → لیست سفارشات کاربر
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, total_amount, status, created_at 
       FROM orders 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

module.exports = router;
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
  const user_id = req.user.id;

  try {
    // گرفتن آیتم‌های سبد خرید کاربر
    const cartItems = await db.query(
      'SELECT * FROM cart_items WHERE user_id = $1',
      [user_id]
    );

    if (cartItems.rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty.' });
    }

    // محاسبه قیمت کل
    let total_price = 0;
    const orderItems = [];

    for (const item of cartItems.rows) {
      const product = await db.query('SELECT price, stock FROM products WHERE id = $1', [item.product_id]);
      if (product.rows.length === 0 || product.rows[0].stock < item.quantity) {
        return res.status(400).json({ error: `Product ${item.product_id} is out of stock.` });
      }
      total_price += product.rows[0].price * item.quantity;
      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: product.rows[0].price
      });
    }

    // شروع تراکنش (برای اطمینان از یکپارچگی داده)
    await db.query('BEGIN');

    // ساخت سفارش جدید
    const orderResult = await db.query(
      'INSERT INTO orders (user_id, total_price) VALUES ($1, $2) RETURNING id',
      [user_id, total_price]
    );
    const orderId = orderResult.rows[0].id;

    // اضافه کردن آیتم‌ها به سفارش
    for (const item of orderItems) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, item.price_at_time]
      );
    }

    // کاهش موجودی محصولات
    for (const item of orderItems) {
      await db.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // پاک کردن سبد خرید
    await db.query('DELETE FROM cart_items WHERE user_id = $1', [user_id]);

    await db.query('COMMIT');

    res.status(201).json({
      message: 'Order placed successfully!',
      orderId: orderId,
      total_price: total_price
    });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to place order.' });
  }
});

// GET /api/orders → لیست سفارشات کاربر
router.get('/', authenticateToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const result = await db.query(
      `SELECT o.id, o.total_price, o.status, o.created_at,
              json_agg(
                json_build_object(
                  'product_id', oi.product_id,
                  'quantity', oi.quantity,
                  'price_at_time', oi.price_at_time
                )
              ) AS items
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [user_id]
    );

    res.json({
      orders: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

module.exports = router;
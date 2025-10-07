// server/routes/cartRoutes.js
const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware: احراز هویت برای کاربران لاگین‌شده
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

// GET /api/cart → دریافت لیست محصولات سبد خرید کاربر
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.id, c.quantity, p.id AS product_id, p.name, p.price
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.added_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ error: 'Failed to fetch cart items.' });
  }
});

// POST /api/cart → افزودن محصول به سبد خرید
router.post('/', authenticateToken, async (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  // اعتبارسنجی ورودی
  if (!product_id || typeof product_id !== 'number' || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid product ID or quantity.' });
  }

  try {
    // بررسی وجود محصول
    const productCheck = await db.query('SELECT id FROM products WHERE id = $1', [product_id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // اضافه کردن به سبد خرید
    const result = await db.query(`
      INSERT INTO cart (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, product_id, quantity
    `, [req.user.id, product_id, quantity]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ error: 'Failed to add item to cart.' });
  }
});

// DELETE /api/cart/:id → حذف یک آیتم از سبد خرید
router.delete('/:id', authenticateToken, async (req, res) => {
  const cartItemId = parseInt(req.params.id);

  if (isNaN(cartItemId)) {
    return res.status(400).json({ error: 'Invalid cart item ID.' });
  }

  try {
    const result = await db.query(
      'DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING id',
      [cartItemId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found or access denied.' });
    }

    res.json({ message: 'Item removed from cart successfully.' });
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ error: 'Failed to remove item from cart.' });
  }
});

// PATCH /api/cart/:id → به‌روزرسانی تعداد یک آیتم در سبد خرید (اختیاری ولی مفید)
router.patch('/:id', authenticateToken, async (req, res) => {
  const cartItemId = parseInt(req.params.id);
  const { quantity } = req.body;

  if (isNaN(cartItemId) || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid cart item ID or quantity.' });
  }

  try {
    const result = await db.query(
      'UPDATE cart SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [quantity, cartItemId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found or access denied.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating cart item:', err);
    res.status(500).json({ error: 'Failed to update cart item.' });
  }
});

// DELETE /api/cart → خالی کردن کل سبد خرید (اختیاری)
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Cart cleared successfully.' });
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ error: 'Failed to clear cart.' });
  }
});

module.exports = router;
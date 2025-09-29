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

// POST /api/cart → اضافه کردن به سبد خرید
router.post('/', authenticateToken, async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  const user_id = req.user.id;

  if (!product_id) {
    return res.status(400).json({ error: 'Product ID is required.' });
  }

  try {
    // چک کردن وجود محصول
    const productCheck = await db.query('SELECT * FROM products WHERE id = $1', [product_id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // چک کردن موجودی
    if (productCheck.rows[0].stock < quantity) {
      return res.status(400).json({ error: 'Not enough stock available.' });
    }

    // اضافه کردن به سبد خرید
    const result = await db.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3) RETURNING *`,
      [user_id, product_id, quantity]
    );

    res.status(201).json({
      message: 'Product added to cart!',
      cartItem: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add to cart.' });
  }
});

// GET /api/cart → مشاهده سبد خرید کاربر
router.get('/', authenticateToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const result = await db.query(
      `SELECT c.id, c.quantity, c.created_at, 
              p.id AS product_id, p.name, p.price, p.image_url
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [user_id]
    );

    res.json({
      cart: result.rows,
      totalItems: result.rows.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cart.' });
  }
});

// DELETE /api/cart/:id → حذف آیتم از سبد خرید
router.delete('/:id', authenticateToken, async (req, res) => {
  const cartItemId = req.params.id;
  const user_id = req.user.id;

  try {
    // چک کردن مالکیت آیتم
    const itemCheck = await db.query(
      'SELECT * FROM cart_items WHERE id = $1 AND user_id = $2',
      [cartItemId, user_id]
    );

    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found or access denied.' });
    }

    await db.query('DELETE FROM cart_items WHERE id = $1', [cartItemId]);

    res.json({ message: 'Item removed from cart.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove item.' });
  }
});

module.exports = router;
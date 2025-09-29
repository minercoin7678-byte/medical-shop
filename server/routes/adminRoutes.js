const express = require('express');
const db = require('../db');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

// GET /api/admin/products → لیست همه محصولات (برای ادمین)
router.get('/products', adminAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

// POST /api/admin/products → افزودن محصول جدید
router.post('/products', adminAuth, async (req, res) => {
  const { name, description, price, stock, category, image_url } = req.body;

  if (!name || !price || !stock || !category) {
    return res.status(400).json({ error: 'Name, price, stock, and category are required.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO products (name, description, price, stock, category, image_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description, price, stock, category, image_url]
    );

    res.status(201).json({
      message: 'Product added successfully!',
      product: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add product.' });
  }
});

// PUT /api/admin/products/:id → ویرایش محصول
router.put('/products/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, category, image_url } = req.body;

  try {
    const result = await db.query(
      `UPDATE products
       SET name = $1, description = $2, price = $3, stock = $4, category = $5, image_url = $6
       WHERE id = $7
       RETURNING *`,
      [name, description, price, stock, category, image_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json({
      message: 'Product updated successfully!',
      product: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

// DELETE /api/admin/products/:id → حذف محصول
router.delete('/products/:id', adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json({ message: 'Product deleted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

// GET /api/admin/orders → لیست همه سفارشات
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.id, o.total_price, o.status, o.created_at, u.name AS user_name, u.email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );

    res.json({ orders: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// GET /api/admin/users → لیست همه کاربران
router.get('/users', adminAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY id ASC'
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

module.exports = router;
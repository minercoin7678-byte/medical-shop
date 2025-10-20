// server/routes/adminRoutes.js
const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware داخلی برای احراز هویت ادمین (بدون نیاز به فایل جداگانه)
const adminAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    req.user = user;
    next();
  });
};


// GET /api/admin/products → لیست همه محصولات با نام دسته‌بندی
router.get('/products', adminAuth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.image_url,
        p.category_id,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Products fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

// POST /api/admin/products
router.post('/products', adminAuth, async (req, res) => {
  const { name, description, price, stock = 999, category, image_url } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required.' });
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

// PUT /api/admin/products/:id
// PUT /api/admin/products/:id → ویرایش محصول
router.put('/products/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  // ✅ فقط category_id — نه category
  const { name, description, price, stock, category_id, image_url } = req.body;

  try {
    const result = await db.query(
      `UPDATE products
       SET name = $1, description = $2, price = $3, stock = $4, category_id = $5, image_url = $6
       WHERE id = $7
       RETURNING *`,
      [name, description, price, stock, category_id, image_url, id] // ✅ category_id
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json({
      message: 'Product updated successfully!',
      product: result.rows[0]
    });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

// DELETE /api/admin/products/:id
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

// GET /api/admin/orders
router.get('/orders', adminAuth, async (req, res) => {
  try {
    // تغییر total_price به total_amount برای هماهنگی با orderRoutes.js
    const result = await db.query(
      `SELECT o.id, o.total_amount, o.status, o.created_at, u.name AS user_name, u.email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );

    res.json(result.rows); // بدون wrapper { orders: ... } برای هماهنگی با فرانت‌اند
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// GET /api/admin/users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY id ASC'
    );
    res.json(result.rows); // بدون wrapper { users: ... }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});
// GET /admin/categories → لیست درختی دسته‌بندی‌ها
// GET /api/admin/categories → لیست درختی دسته‌بندی‌ها
router.get('/categories', adminAuth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, name, slug, parent_id, description
      FROM categories
      ORDER BY created_at ASC
    `);
    
    // تبدیل به ساختار درختی
    const categories = result.rows;
    const map = {};
    const roots = [];

    categories.forEach(cat => {
      map[cat.id] = { ...cat, children: [] };
    });

    categories.forEach(cat => {
      if (cat.parent_id === null) {
        roots.push(map[cat.id]);
      } else {
        if (map[cat.parent_id]) {
          map[cat.parent_id].children.push(map[cat.id]);
        }
      }
    });

    res.json(roots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// POST /admin/categories → افزودن دسته جدید
router.post('/categories', adminAuth, async (req, res) => {
  const { name, slug, parent_id, description } = req.body;
  
  if (!name || !slug) {
    return res.status(400).json({ error: 'Name and slug are required.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO categories (name, slug, parent_id, description)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, slug, parent_id || null, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add category.' });
  }
});

// PUT /admin/categories/:id → ویرایش دسته
// PUT /api/admin/products/:id → ویرایش محصول
router.put('/products/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, category_id, image_url } = req.body;

  try {
    const result = await db.query(
      `UPDATE products
       SET name = $1, description = $2, price = $3, stock = $4, category_id = $5, image_url = $6
       WHERE id = $7
       RETURNING *`,
      [name, description, price, stock, category_id, image_url, id]
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

// DELETE /admin/categories/:id → حذف دسته
router.delete('/categories/:id', adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM categories WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    res.json({ message: 'Category deleted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete category.' });
  }
});
// GET /api/admin/products/:id → دریافت یک محصول
router.get('/products/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product.' });
  }
});
module.exports = router;
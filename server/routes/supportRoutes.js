const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/support/faqs → لیست سوالات متداول
router.get('/faqs', async (req, res) => {
  try {
    const result = await db.query('SELECT id, question, answer FROM faqs ORDER BY id ASC');
    res.json({ faqs: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch FAQs.' });
  }
});

// GET /api/support/contact → اطلاعات تماس (واتس‌اپ)
router.get('/contact', (req, res) => {
  res.json({
    whatsapp: '+989363990232', // ← شماره واتس‌اپ خودت رو بذار
    message: 'برای پشتیبانی زنده، روی لینک زیر کلیک کنید:'
  });
});

module.exports = router;
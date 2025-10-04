require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = process.env.PORT || 5000;

// ⚠️ اول CORS رو تنظیم کن — قبل از هر چیزی
app.use(cors({
  origin: [
    'http://localhost:5173', // برای توسعه
    'https://medical-shop-la5we7ceh-amirs-projects-43cfa8db.vercel.app/' // ✅ آدرس Vercel — بدون https:// تکراری و بدون فاصله
  ],
  credentials: true
}));

// امنیت HTTP
app.use(helmet());

// پارس کردن JSON
app.use(express.json());

// محدودیت تعداد درخواست‌ها برای لاگین
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقیقه
  max: 5, // حداکثر 5 بار
  message: 'تعداد درخواست‌های شما بیش از حد مجاز است.'
});
app.use('/api/login', loginLimiter);

// ⚠️ مسیرها رو بعد از CORS و موارد اولیه تعریف کن
const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

const cartRoutes = require('./routes/cartRoutes');
app.use('/api/cart', cartRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

const supportRoutes = require('./routes/supportRoutes');
app.use('/api/support', supportRoutes);

// صفحهٔ اصلی
app.get('/', (req, res) => {
  res.send('Medical Shop Server is ready!');
});

// راه‌اندازی سرور
app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT + '...');
});
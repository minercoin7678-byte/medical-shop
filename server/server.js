require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const PORT = process.env.PORT || 5000;



// لیست آدرس‌های مجاز (فرانت‌اند شما)
const allowedOrigins = [
  'http://localhost:5000',           // توسعه لوکال
  'https://medical-shop-alpha.vercel.app/' // آدرس نهایی Vercel شما
];

const corsOptions = {
  origin: (origin, callback) => {
    // اجازه بده اگر origin در لیست مجاز باشه یا undefined باشه (مثل Postman یا curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // اگر نیاز به کوکی داری (معمولاً برای JWT لازم نیست، ولی امن‌تره)
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ⚠️ اول CORS رو تنظیم کن — قبل از هر چیزی
app.use(cors({
  origin: true, // ⚠️ همه آدرس‌ها رو قبول می‌کنه — فقط برای تست
  credentials: true
}));

// امنیت HTTP
app.use(helmet());

// پارس کردن JSON
app.use(express.json());
app.set('trust proxy', 1);

// محدودیت تعداد درخواست‌ها برای لاگین
//const loginLimiter = rateLimit({
//  windowMs: 15 * 60 * 1000, // 15 دقیقه
 // max: 5, // حداکثر 5 بار
 /// message: 'تعداد درخواست‌های شما بیش از حد مجاز است.'
//});
//app.use('/api/login', loginLimiter);

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
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});



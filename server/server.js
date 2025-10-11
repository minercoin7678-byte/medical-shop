require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./db');

const app = express();

// تنظیمات CORS هوشمند — بدون آدرس ثابت Vercel
const corsOptions = {
  origin: (origin, callback) => {
    // اجازه بده اگر:
    // - origin خالی باشه (مثل Postman)
    // - یا لوکال باشه (Vite روی 5173)
    // - یا زیردامنه‌ی Vercel باشه
    if (
      !origin ||
      origin === 'http://localhost:5173' ||
      origin.endsWith('.vercel.app')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// میدلورهای امنیتی و پارس کردن JSON
app.use(helmet());
app.use(express.json());
app.set('trust proxy', 1);

// روت‌ها
app.use('/api', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));

// صفحه اصلی
app.get('/', (req, res) => {
  res.send('Medical Shop Server is ready!');
});

// راه‌اندازی سرور — الزامی در Render: 0.0.0.0
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
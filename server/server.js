require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./db');

const app = express();

// ✅ فقط یک بار CORS رو تنظیم کن — بدون تکرار!
const allowedOrigins = [
  'http://localhost:5000'
];

const corsOptions = {
  origin: (origin, callback) => {
    // اجازه بده همه زیردامنه‌های vercel.app
    if (!origin || 
        origin === 'http://localhost:5000' || 
        origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); // ✅ فقط یک بار

// میدلورهای دیگه
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

// ✅ فقط یک بار سرور رو اجرا کن — با 0.0.0.0
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
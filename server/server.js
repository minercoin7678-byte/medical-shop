require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// امنیت HTTP
app.use(helmet());

// محدودیت تعداد درخواست‌ها برای لاگین
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقیقه
  max: 5, // حداکثر 5 بار
  message: 'تعداد درخواست‌های شما بیش از حد مجاز است.'
});
app.use('/api/login', loginLimiter);

// ⚠️ ترتیب مهمه: اول /api، بعد /api/products
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

app.get('/', (req, res) => {
  res.send('Medical Shop Server is ready!');
});

app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT + '...');
});


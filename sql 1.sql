CREATE TABLE IF NOT EXISTS users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role VARCHAR(20) DEFAULT 'user'
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(100) NOT NULL,
  image_url VARCHAR(500)
);
CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- جدول اصلی سفارشات
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_price DECIMAL(12,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'در انتظار پرداخت',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول آیتم‌های سفارش
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_time DECIMAL(10,2) NOT NULL
);
CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO products (name, description, price, stock, category, image_url) VALUES
('سوزن طب سوزنی 0.25mm', 'سوزن با کیفیت بالا برای استفاده در طب سوزنی، ساخت کره جنوبی', 120000.00, 50, 'طب سوزنی', 'https://example.com/needle.jpg'),
('فیلر هیالورونیک اسید 1ml', 'فیلر با خلوص بالا برای استفاده در کلینیک‌های زیبایی', 850000.00, 20, 'فیلرهای زیبایی', 'https://example.com/filler.jpg');
INSERT INTO faqs (question, answer) VALUES
('آیا محصولات شما اصل هستند؟', 'بله، تمام محصولات ما از برندهای معتبر و با گارانتی اصالت عرضه می‌شوند.'),
('چگونه می‌توانم سفارش خود را پیگیری کنم؟', 'پس از ثبت سفارش، کد رهگیری به ایمیل و پیامک شما ارسال می‌شود. همچنین می‌توانید از داشبورد کاربری خود سفارشات را مشاهده کنید.'),
('آیا امکان بازگشت کالا وجود دارد؟', 'در صورت معیوب بودن کالا، تا ۷ روز پس از دریافت، امکان بازگشت وجود دارد.');
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role VARCHAR(20) DEFAULT 'user'
);

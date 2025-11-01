import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import api from './services/api';
import './App.css';
import { Outlet, useLocation } from 'react-router-dom';


// --- PublicLayout: نمایش هدر/فوتر فقط برای صفحات عمومی ---
function PublicLayout() {
  const location = useLocation();
  const isExcluded = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/admin/login',
    '/cart'
  ].some(path => location.pathname.startsWith(path)) || 
  location.pathname.startsWith('/dashboard') ||
  location.pathname.startsWith('/admin/');

  if (isExcluded) {
    return <Outlet />; // بدون هدر/فوتر
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow"><Outlet /></main>
      <Footer />
    </div>
  );
}

// --- Header (بدون Tailwind) ---
function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || null;
  return (
    <header className="app-header">
      <div className="container">
        <div 
          className="logo"
          onClick={() => navigate('/')}
        >
          مدی<span className="text-trust-green">شاپ</span>
        </div>
        <nav className="nav-menu">
          <button 
            onClick={() => navigate('/')}
            className="nav-link"
          >
            صفحه اصلی
          </button>
          <button 
            onClick={() => navigate('/products')}
            className="nav-link"
          >
            محصولات
          </button>
          <button 
            onClick={() => navigate('/about')}
            className="nav-link"
          >
            درباره ما
          </button>
          <button 
            onClick={() => navigate('/contact')}
            className="nav-link"
          >
            تماس با ما
          </button>
        </nav>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/cart')}
            className="cart-icon"
            aria-label="سبد خرید"
          >
            🛒
          </button>
          {user ? (
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
              }}
              className="logout-btn"
            >
              خروج
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="login-btn"
            >
              ورود
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// --- Footer ---
// --- Footer (بدون Tailwind) ---
function Footer() {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3 className="footer-title">مدیشاپ</h3>
            <p className="footer-text">
              ارائه‌دهنده‌ی معتبر تجهیزات پزشکی با بیش از ۱۰ سال سابقه
            </p>
          </div>
          <div className="footer-col">
            <h4 className="footer-subtitle">لینک‌های سریع</h4>
            <ul className="footer-links">
              <li><button onClick={() => window.location.href='/'}>صفحه اصلی</button></li>
              <li><button onClick={() => window.location.href='/products'}>محصولات</button></li>
              <li><button onClick={() => window.location.href='/about'}>درباره ما</button></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-subtitle">پشتیبانی</h4>
            <ul className="footer-links">
              <li><button onClick={() => window.location.href='/contact'}>تماس با ما</button></li>
              <li><button>سوالات متداول</button></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-subtitle">تماس</h4>
            <address className="footer-contact">
              تهران، خیابان ولیعصر<br />
              ☎️ ۰۲۱-۱۲۳۴۵۶۷۸<br />
              ✉️ info@medishop.ir
            </address>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} مدیشاپ. تمامی حقوق محفوظ است.
        </div>
      </div>
    </footer>
  );
}
// --- Home: صفحه اصلی با Hero Section لوکس ---
function Home() {
  const [products, setProducts] = useState([]);
  const user = JSON.parse(localStorage.getItem('user')) || null;
  const navigate = useNavigate();

  useEffect(() => {
    api('/products')
      .then(data => setProducts(data))
      .catch(err => console.error('Error loading products:', err));
  }, []);

  const addToCart = async (productId) => {
    try {
      await api('/cart', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity: 1 })
      });
      alert('محصول به سبد خرید اضافه شد!');
    } catch (err) {
      alert('خطا: ' + err.message);
    }
  };

  return (
  <div className="bg-light-bg pt-16">
    {/* Hero Section */}
    <div className="bg-red-500 text-white p-6 text-2xl">
      اگر این قرمز نشد، Tailwind کار نمی‌کنه!
    </div>
    <div className="bg-gradient-to-r from-medical-blue to-medical-blue-dark text-white py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">تجهیزات پزشکی با کیفیت جهانی</h1>
        <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
          ارائه‌دهنده‌ی معتبر تجهیزات تشخیصی، آزمایشگاهی و بیمارستانی با گارانتی اصالت کالا
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate('/products')}
            className="bg-trust-green hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition"
          >
            مشاهده محصولات
          </button>
          <button
            onClick={() => navigate('/contact')}
            className="bg-white text-medical-blue hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition"
          >
            تماس با ما
          </button>
        </div>
      </div>
    </div>

    {/* Dashboard Button (if logged in) */}
    {user && (
      <div className="container mx-auto px-4 py-4">
        <button
          onClick={() => {
            if (user.role === 'admin') {
              navigate('/admin/dashboard');
            } else {
              navigate('/dashboard');
            }
          }}
          className="mb-6 bg-medical-blue text-white px-5 py-2.5 rounded-lg hover:bg-medical-blue-dark transition"
        >
          بازگشت به داشبورد
        </button>
      </div>
    )}

    {/* Products Section */}
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-medical-blue mb-3">محصولات برگزیده</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          مجموعه‌ای از بهترین تجهیزات پزشکی با کیفیت تأییدشده و گارانتی اصالت
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-600">محصولی برای نمایش وجود ندارد.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(p => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 border border-gray-100"
            >
              {p.image_url ? (
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=تصویر+محصول';
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">بدون تصویر</span>
                </div>
              )}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-medical-blue mb-2">{p.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {p.description || 'توضیحاتی ثبت نشده است.'}
                </p>
                <p className="text-lg font-bold text-trust-green mb-3">
                  {p.price?.toLocaleString()} تومان
                </p>
                <button
                  onClick={() => addToCart(p.id)}
                  className="w-full bg-medical-blue text-white py-2 rounded-lg hover:bg-medical-blue-dark transition"
                >
                  افزودن به سبد خرید
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
}
// کامپوننت تغییر رمز عبور
function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (password !== confirmPassword) {
      setMessage('رمزهای عبور مطابقت ندارند.');
      return;
    }
    
    if (password.length < 6) {
      setMessage('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    try {
      const data = await api('/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword: password })
      });
      alert('رمز عبور با موفقیت تغییر کرد. اکنون می‌توانید وارد شوید.');
      navigate('/login');
    } catch (err) {
      setMessage(err.message || 'خطا در تغییر رمز عبور');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">تغییر رمز عبور</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="رمز عبور جدید (حداقل ۶ کاراکتر)"
          className="w-full p-2 border rounded mb-2"
          required
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="تکرار رمز عبور"
          className="w-full p-2 border rounded mb-2"
          required
        />
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
          تغییر رمز عبور
        </button>
        {message && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
            {message}
          </div>
        )}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="mt-2 text-blue-600"
        >
          بازگشت به ورود
        </button>
      </form>
    </div>
  );
}

// کامپوننت فراموشی رمز عبور
function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const data = await api('/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setMessage(err.message || 'خطا در ارسال درخواست');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">فراموشی رمز عبور</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ایمیل شما"
          className="w-full p-2 border rounded mb-2"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          ارسال لینک بازیابی
        </button>
        {message && (
          <div className={`mt-2 p-2 rounded ${message.includes('خطا') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="mt-2 text-blue-600"
        >
          بازگشت به ورود
        </button>
      </form>
    </div>
  );
}

// کامپوننت لاگین واحد (برای همه کاربران)
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    fetch('https://medical-shop-backend-v1u1.onrender.com/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      })
      .catch(err => setError(err.message));
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="mt-2 text-center">
  <Link to="/forgot-password" className="text-blue-600 text-sm hover:underline">
    فراموشی رمز عبور؟
  </Link>
</div>
      <h2 className="text-2xl font-bold mb-4">ورود</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ایمیل"
          className="w-full p-2 border mb-2 rounded"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="رمز عبور"
          className="w-full p-2 border mb-2 rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          ورود
        </button>
      </form>
    </div>
  );
}

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    api('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
      .then(data => {
        if (data.user.role !== 'admin') {
          throw new Error('دسترسی ادمین مورد نیاز است.');
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/admin/dashboard');
      })
      .catch(err => setError(err.message));
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">ورود ادمین</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ایمیل ادمین"
          className="w-full p-2 border mb-2 rounded"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="رمز عبور"
          className="w-full p-2 border mb-2 rounded"
          required
        />
        <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded">ورود</button>
      </form>
    </div>
  );
}

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api('/orders')
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading orders:', err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  navigate('/', { replace: true }); // ✅ رفتار صحیح
};

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">داشبورد کاربر</h2>
      <p><strong>نام:</strong> {user.name}</p>
      <p><strong>ایمیل:</strong> {user.email}</p>
      <p><strong>نقش:</strong> {user.role}</p>

      <div className="mt-6">
        <h3 className="text-xl font-bold mb-2">لینک‌های سریع</h3>
        <button
          onClick={() => navigate('/cart')}
          className="bg-green-600 text-white px-4 py-2 rounded mr-2"
        >
          سبد خرید
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold mb-2">سابقه سفارشات</h3>
        {loading ? (
          <p>در حال بارگذاری...</p>
        ) : orders.length === 0 ? (
          <p>شما هنوز سفارشی ثبت نکرده‌اید.</p>
        ) : (
          <div className="space-y-2">
            {orders.map(order => (
              <div key={order.id} className="border p-3 rounded">
                <p>شماره سفارش: #{order.id}</p>
                <p>تاریخ: {new Date(order.created_at).toLocaleDateString('fa-IR')}</p>
                <p>مبلغ کل: {order.total_amount.toLocaleString()} تومان</p>
                <p>وضعیت: <span className="font-bold">{order.status === 'pending' ? 'در انتظار' : order.status}</span></p>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 bg-red-600 text-white px-4 py-2 rounded"
      >
        خروج
      </button>
    </div>
  );
}
// کامپوننت افزودن محصول
function AddProduct() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('999');
  const [category, setCategory] = useState('');
  const [image_url, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // اعتبارسنجی
    if (!name || !price || !category) {
      setError('نام، قیمت و دسته‌بندی اجباری هستند.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetch('https://medical-shop-backend-v1u1.onrender.com/api/admin/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, description, price: parseFloat(price), stock: parseInt(stock), category, image_url })
    })
      .then(res => {
        if (!res.ok) throw new Error('خطا در افزودن محصول');
        return res.json();
      })
      .then(() => {
        setSuccess('محصول با موفقیت اضافه شد!');
        // ریست فرم
        setName('');
        setDescription('');
        setPrice('');
        setStock('999');
        setCategory('');
        setImageUrl('');
      })
      .catch(err => setError(err.message));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">افزودن محصول جدید</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-2 mb-4 rounded">{success}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="نام محصول *"
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="توضیحات"
          className="w-full p-2 border rounded"
          rows="3"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="قیمت (تومان) *"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="موجودی *"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="دسته‌بندی *"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="url"
          value={image_url}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="لینک تصویر (اختیاری)"
          className="w-full p-2 border rounded"
        />
        <div className="flex gap-2">
  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
    افزودن محصول
  </button>
  <button
    type="button"
    onClick={() => navigate('/admin/dashboard')}
    className="bg-gray-500 text-white px-4 py-2 rounded"
  >
    بازگشت به داشبورد ادمین
  </button>
</div>
      </form>
    </div>
  );
}
// کامپوننت افزودن دسته‌بندی جدید
// کامپوننت افزودن دسته‌بندی جدید
function AddCategory() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ حالا استفاده می‌شه
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ تابع flattenCategories رو داخل useEffect تعریف می‌کنیم
    const flattenCategories = (cats, level = 0) => {
      let result = [];
      cats.forEach(cat => {
        result.push({
          id: cat.id,
          name: `${'—'.repeat(level)} ${cat.name}`
        });
        if (cat.children && cat.children.length > 0) {
          result = result.concat(flattenCategories(cat.children, level + 1));
        }
      });
      return result;
    };

    const token = localStorage.getItem('token');
    fetch('https://medical-shop-backend-v1u1.onrender.com/api/admin/categories', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setCategories(flattenCategories(data));
        setLoading(false); // ✅ حالا مقدارش خونده می‌شه
      })
      .catch(() => {
        setError('خطا در بارگذاری لیست دسته‌بندی‌ها');
        setLoading(false);
      });
  }, []); // ✅ بدون نیاز به flattenCategories در وابستگی‌ها

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !slug) {
      setError('نام و نامک (slug) اجباری هستند.');
      return;
    }

    const token = localStorage.getItem('token');
    const payload = {
      name,
      slug,
      description
    };
    if (parentId) payload.parent_id = parseInt(parentId);

    fetch('https://medical-shop-backend-v1u1.onrender.com/api/admin/categories', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('خطا در افزودن دسته‌بندی');
        return res.json();
      })
      .then(() => {
        setSuccess('دسته‌بندی با موفقیت اضافه شد!');
        setTimeout(() => navigate('/admin/categories'), 1500);
      })
      .catch(err => setError(err.message));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">افزودن دسته‌بندی جدید</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-2 mb-4 rounded">{success}</div>}
      
      {/* ✅ نمایش وضعیت بارگذاری */}
      {loading ? (
        <p className="text-center">در حال بارگذاری دسته‌بندی‌ها...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="نام دسته‌بندی *"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/ /g, '-'))}
            placeholder="نامک (slug) * — مثال: lab-devices"
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="توضیحات (اختیاری)"
            className="w-full p-2 border rounded"
            rows="3"
          />
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">دسته اصلی (بدون والد)</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              افزودن دسته‌بندی
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/categories')}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              لغو
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
// کامپوننت ویرایش محصول
// کامپوننت ویرایش محصول (با انتخاب دسته‌بندی از لیست)
// کامپوننت ویرایش محصول (با category_id)
// کامپوننت ویرایش محصول (نسخه ایمن‌تر)
// کامپوننت ویرایش محصول — نسخه نهایی و ایمن
function EditProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState({ category_id: '' });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const flattenCategories = (cats, level = 0) => {
    let result = [];
    cats.forEach(cat => {
      result.push({ id: cat.id, name: `${'—'.repeat(level)} ${cat.name}` });
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, level + 1));
      }
    });
    return result;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetch('https://medical-shop-backend-v1u1.onrender.com/api/admin/categories', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCategories(flattenCategories(data)))
      .catch(err => console.error('Categories error:', err));

    fetch(`https://medical-shop-backend-v1u1.onrender.com/api/admin/products/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        setError('محصول یافت نشد.');
        setLoading(false);
      });
  }, [id, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token'); // ✅ همیشه جدید بخون
    if (!token) {
      navigate('/admin/login');
      return;
    }

    if (!product.name || !product.price || !product.stock || !product.category_id) {
      setError('لطفاً همه فیلدهای اجباری را پر کنید.');
      return;
    }

    const payload = {
      name: product.name.trim(),
      description: product.description?.trim() || '',
      price: parseFloat(product.price),
      stock: parseInt(product.stock),
      category_id: parseInt(product.category_id),
      image_url: product.image_url?.trim() || ''
    };

    if (isNaN(payload.price) || isNaN(payload.stock) || isNaN(payload.category_id)) {
      setError('مقادیر وارد شده معتبر نیستند.');
      return;
    }

    fetch(`https://medical-shop-backend-v1u1.onrender.com/api/admin/products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`, // ✅ حتماً ارسال بشه
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('خطا در به‌روزرسانی محصول');
        return res.json();
      })
      .then(() => {
        setSuccess('محصول با موفقیت به‌روزرسانی شد!');
        setTimeout(() => navigate('/admin/products'), 1500);
      })
      .catch(err => setError(err.message));
  };

  if (loading) return <div className="p-6">در حال بارگذاری...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">ویرایش محصول</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-2 mb-4 rounded">{success}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={product.name || ''}
          onChange={e => setProduct({...product, name: e.target.value})}
          placeholder="نام محصول *"
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          value={product.description || ''}
          onChange={e => setProduct({...product, description: e.target.value})}
          placeholder="توضیحات"
          className="w-full p-2 border rounded"
          rows="3"
        />
        <input
          type="number"
          value={product.price || ''}
          onChange={e => setProduct({...product, price: e.target.value})}
          placeholder="قیمت (تومان) *"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          value={product.stock || ''}
          onChange={e => setProduct({...product, stock: e.target.value})}
          placeholder="موجودی *"
          className="w-full p-2 border rounded"
          required
        />
        <select
          value={product.category_id || ''}
          onChange={e => setProduct({...product, category_id: e.target.value})}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">انتخاب دسته‌بندی *</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input
          type="url"
          value={product.image_url || ''}
          onChange={e => setProduct({...product, image_url: e.target.value})}
          placeholder="لینک تصویر (اختیاری)"
          className="w-full p-2 border rounded"
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            ذخیره تغییرات
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            لغو
          </button>
        </div>
      </form>
    </div>
  );
}
// کامپوننت مدیریت محصولات
function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('https://medical-shop-backend-v1u1.onrender.com/api/admin/products', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading products:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">مدیریت محصولات</h2>
      
      <div className="mb-4">
        <Link to="/admin/add-product" className="bg-green-600 text-white px-4 py-2 rounded mr-2">
          افزودن محصول جدید
        </Link>
        <button 
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={() => navigate('/admin/dashboard')}
        >
          بازگشت
        </button>
      </div>

      {loading ? (
        <p>در حال بارگذاری...</p>
      ) : products.length === 0 ? (
        <p>محصولی وجود ندارد.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border p-2">نام</th>
                <th className="border p-2">قیمت</th>
                <th className="border p-2">موجودی</th>
                <th className="border p-2">دسته‌بندی</th>
                <th className="border p-2">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td className="border p-2">{product.name}</td>
                  <td className="border p-2">{product.price.toLocaleString()} تومان</td>
                  <td className="border p-2">{product.stock || 'نامشخص'}</td>
                  <td className="border p-2">{product.category_name || '-'}</td>                
                    <td className="border p-2">
                    <button
                      onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                    >
                      ویرایش
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
// کامپوننت مدیریت دسته‌بندی
function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // دریافت لیست دسته‌ها
  const fetchCategories = () => {
    const token = localStorage.getItem('token');
    fetch('https://medical-shop-backend-v1u1.onrender.com/api/admin/categories', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(() => {
  setError('خطا در دریافت دسته‌بندی‌ها');
  setLoading(false);
});
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  
// نمایش درختی با رنگ‌بندی سلسله‌مراتبی
// نمایش درختی با رنگ‌بندی سلسله‌مراتبی واضح
const renderCategoryTree = (cats, level = 0) => {
  return cats.map(cat => {
    // رنگ‌بندی
    const getStyle = (level) => {
      if (level === 0) return { backgroundColor: '#fee2e2', border: '1px solid #fecaca' };
      if (level === 1) return { backgroundColor: '#dbeafe', border: '1px solid #bfdbfe' };
      return { backgroundColor: '#fef9c3', border: '1px solid #fde047' };
    };

    return (
      <div key={cat.id} className="mb-2">
        <div 
          className="flex items-center justify-between rounded p-2"
          style={getStyle(level)}
        >
          <span className="font-medium">{cat.name}</span>
          <span className="text-sm text-gray-600">({cat.slug})</span>
          <div className="flex gap-1">
            <button className="bg-blue-500 text-white text-xs px-2 py-1 rounded">ویرایش</button>
            <button className="bg-red-500 text-white text-xs px-2 py-1 rounded">حذف</button>
          </div>
        </div>
        {/* نمایش زیرمجموعه‌ها با فاصله سلسله‌مراتبی */}
        {cat.children && cat.children.length > 0 && (
          <div style={{ paddingLeft: `${(level + 1) * 20}px`, marginTop: '8px' }}>
            {renderCategoryTree(cat.children, level + 1)}
          </div>
        )}
      </div>
    );
  });
};

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">مدیریت دسته‌بندی‌ها</h2>
      
      <div className="mb-4">
  <Link to="/admin/categories/add" className="bg-green-600 text-white px-4 py-2 rounded">
    افزودن دسته جدید
  </Link>
  <button 
    className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
    onClick={() => navigate('/admin/dashboard')}
  >
    بازگشت
  </button>
</div>

      {loading ? (
        <p>در حال بارگذاری...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div>
          {categories.length === 0 ? (
            <p>هیچ دسته‌بندی‌ای وجود ندارد.</p>
          ) : (
            renderCategoryTree(categories)
          )}
        </div>
      )}
    </div>
  );
}
// کامپوننت داشبورد ادمین (کامل‌شده)
// کامپوننت داشبورد ادمین (نسخه ایمن و کامل)
function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const fetchWithAuth = (endpoint) => {
      return fetch(`https://medical-shop-backend-v1u1.onrender.com/api${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => {
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/admin/login');
          }
          throw new Error('خطا در دریافت داده');
        }
        return res.json();
      });
    };

    fetchWithAuth('/admin/products')
      .then(data => setProducts(data))
      .catch(err => console.error('Error loading products:', err));

    fetchWithAuth('/admin/orders')
      .then(data => setOrders(data))
      .catch(err => console.error('Error loading orders:', err));

    fetchWithAuth('/admin/users')
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading users:', err);
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">داشبورد ادمین</h2>
      <div className="mb-6">
  <Link to="/admin/products" className="bg-purple-600 text-white px-4 py-2 rounded">
    مدیریت محصولات
  </Link>
</div>
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">لیست محصولات</h3>
        {products.length === 0 ? (
          <p>محصولی وجود ندارد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="border p-2">نام</th>
                  <th className="border p-2">قیمت</th>
                  <th className="border p-2">موجودی</th>
                  <th className="border p-2">دسته‌بندی</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="border p-2">{product.name}</td>
                    <td className="border p-2">{product.price.toLocaleString()} تومان</td>
                    <td className="border p-2">{product.stock || 'نامشخص'}</td>
                    <td className="border p-2">{product.category_name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">لیست سفارشات</h3>
        {loading ? (
          <p>در حال بارگذاری...</p>
        ) : orders.length === 0 ? (
          <p>سفارشی وجود ندارد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="border p-2">شماره سفارش</th>
                  <th className="border p-2">کاربر</th>
                  <th className="border p-2">مبلغ</th>
                  <th className="border p-2">وضعیت</th>
                  <th className="border p-2">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="border p-2">#{order.id}</td>
                    <td className="border p-2">{order.user_name} ({order.email})</td>
                    <td className="border p-2">{order.total_amount.toLocaleString()} تومان</td>
                    <td className="border p-2">
                      <span className="font-bold">
                        {order.status === 'pending' ? 'در انتظار' : order.status}
                      </span>
                    </td>
                    <td className="border p-2">
                      {new Date(order.created_at).toLocaleDateString('fa-IR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">لیست کاربران</h3>
        {loading ? (
          <p>در حال بارگذاری...</p>
        ) : users.length === 0 ? (
          <p>کاربری وجود ندارد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="border p-2">نام</th>
                  <th className="border p-2">ایمیل</th>
                  <th className="border p-2">نقش</th>
                  <th className="border p-2">تاریخ عضویت</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="border p-2">{user.name}</td>
                    <td className="border p-2">{user.email}</td>
                    <td className="border p-2">
                      <span className={user.role === 'admin' ? 'text-red-600 font-bold' : ''}>
                        {user.role}
                      </span>
                    </td>
                    <td className="border p-2">
                      {new Date(user.created_at).toLocaleDateString('fa-IR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        <div className="mb-4">
  <Link to="/admin/add-product" className="bg-blue-600 text-white px-4 py-2 rounded">
    افزودن محصول جدید
  </Link>
  <Link to="/admin/categories" className="bg-purple-600 text-white px-4 py-2 rounded mr-2">
  مدیریت دسته‌بندی‌ها
</Link>
</div>
      <button
        onClick={handleLogout}
        className="mt-4 bg-red-600 text-white p-2 rounded"
      >
        خروج
      </button>
    </div>
  );
}
// کامپوننت ثبت‌نام
function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    api('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone, address }),
    })
      .then(data => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      })
      .catch(err => setError(err.message || 'خطا در ثبت‌نام'));
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">ثبت‌نام</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="نام کامل"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ایمیل"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="رمز عبور"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="شماره تلفن"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="آدرس"
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
          ثبت‌نام
        </button>
      </form>
    </div>
  );
}
function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api('/cart')
      .then(data => {
        setCartItems(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const removeFromCart = (id) => {
    api(`/cart/${id}`, { method: 'DELETE' })
      .then(() => {
        setCartItems(cartItems.filter(item => item.id !== id));
      })
      .catch(err => alert('خطا در حذف از سبد: ' + err.message));
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) return <div className="p-6">در حال بارگذاری...</div>;
  if (error) return <div className="p-6 text-red-600">خطا: {error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">سبد خرید شما</h2>
      {cartItems.length === 0 ? (
        <p className="text-gray-600">سبد خرید شما خالی است.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center justify-between border p-4 rounded">
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p>تعداد: {item.quantity}</p>
                  <p className="text-green-600">قیمت واحد: {item.price} تومان</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="text-xl font-bold">جمع کل: {total.toLocaleString()} تومان</h3>
            <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">
              ادامه فرآیند خرید
            </button>
          </div>
        </>
      )}
      <button
        onClick={() => navigate(-1)}
        className="mt-4 text-blue-600"
      >
        بازگشت
      </button>
    </div>
  );
}
// --- ProductsPage: صفحه لیست محصولات با استایل کامل ---
function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Fetching products...');
    api('/products')
      .then(data => {
        console.log('Products data:', data);
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading products:', err);
        setLoading(false);
      });
  }, []);

  const viewDetails = (id) => {
    navigate(`/product/${id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-medical-blue">در حال بارگذاری محصولات...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-medical-blue mb-8 text-center">محصولات</h1>
      {products.length === 0 ? (
        <p className="text-center text-gray-600">محصولی برای نمایش وجود ندارد.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=تصویر+محصول';
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">بدون تصویر</span>
                </div>
              )}
              <div className="p-5">
                <h2 className="text-xl font-semibold text-medical-blue mb-2">{product.name}</h2>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description || 'توضیحاتی برای این محصول ثبت نشده است.'}
                </p>
                <p className="text-lg font-bold text-trust-green mb-4">
                  {product.price?.toLocaleString()} تومان
                </p>
                <button
                  onClick={() => viewDetails(product.id)}
                  className="w-full bg-medical-blue text-white py-2 rounded-lg hover:bg-medical-blue-dark transition"
                >
                  مشاهده جزئیات
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// --- ProductDetail: صفحه جزئیات محصول ---
// --- ProductDetail: صفحه جزئیات محصول (بدون Tailwind) ---
function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    // دریافت محصول + دسته‌بندی
    Promise.all([
      api(`/products/${id}`),
      api('/categories')
    ])
      .then(([productData, categoriesData]) => {
        const category = categoriesData.find(c => c.id == productData.category_id);
        setProduct({
          ...productData,
          category_name: category ? category.name : 'نامشخص'
        });
        setLoading(false);
      })
      .catch(err => {
        setError('محصول مورد نظر یافت نشد.');
        setLoading(false);
      });
  }, [id]);

  const addToCart = async () => {
    try {
      await api('/cart', {
        method: 'POST',
        body: JSON.stringify({ product_id: id, quantity: 1 })
      });
      alert('محصول به سبد خرید اضافه شد!');
    } catch (err) {
      alert('خطا: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-medical-blue">در حال بارگذاری جزئیات محصول...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate('/products')}
          className="mt-4 text-medical-blue hover:underline"
        >
          بازگشت به لیست محصولات
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/products')}
        className="mb-6 text-medical-blue hover:underline flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        بازگشت به لیست محصولات
      </button>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="md:flex">
          <div className="md:w-1/2 p-6 flex items-center justify-center">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="max-w-full h-auto rounded-lg shadow-md"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x400?text=تصویر+محصول';
                }}
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg">
                <span className="text-gray-400">بدون تصویر</span>
              </div>
            )}
          </div>
          <div className="md:w-1/2 p-6">
            <div className="mb-2">
              <span className="text-sm text-trust-green font-medium">{product.category_name}</span>
            </div>
            <h1 className="text-2xl font-bold text-medical-blue mb-3">{product.name}</h1>
            <p className="text-gray-700 mb-4 leading-relaxed">
              {product.description || 'توضیحاتی برای این محصول ثبت نشده است.'}
            </p>
            <div className="mb-4">
              <span className="text-xl font-bold text-trust-green">
                {product.price?.toLocaleString()} تومان
              </span>
              {product.stock !== undefined && (
                <div className="mt-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock > 0 ? `موجود در انبار (${product.stock})` : 'ناموجود'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-white transition ${
                  product.stock === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-medical-blue hover:bg-medical-blue-dark'
                }`}
              >
                {product.stock === 0 ? 'ناموجود' : 'افزودن به سبد خرید'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// --- AboutPage: درباره ما ---
function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-medical-blue mb-8 text-center">درباره مدیشاپ</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8 border border-gray-100">
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            مدیشاپ با بیش از ۱۰ سال سابقه درخشان در حوزه تأمین تجهیزات پزشکی، 
            همواره متعهد به ارائه‌ی محصولاتی با کیفیت جهانی، گارانتی اصالت کالا و پشتیبانی حرفه‌ای بوده است.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            ما با همکاری مستقیم با تولیدکنندگان معتبر اروپایی و آمریکایی، 
            طیف گسترده‌ای از تجهیزات تشخیصی، آزمایشگاهی، بیمارستانی و خانگی را 
            با ضمانت کیفیت و خدمات پس از فروش ارائه می‌دهیم.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center p-4">
              <div className="text-trust-green text-3xl font-bold">۱۰+</div>
              <div className="text-gray-600">سال سابقه</div>
            </div>
            <div className="text-center p-4">
              <div className="text-trust-green text-3xl font-bold">۵۰۰+</div>
              <div className="text-gray-600">محصول فعال</div>
            </div>
            <div className="text-center p-4">
              <div className="text-trust-green text-3xl font-bold">۹۸%</div>
              <div className="text-gray-600">رضایت مشتریان</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// --- ContactPage: تماس با ما ---
function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess('');
    
    // ⚠️ نکته: اینجا فقط UI تماس ساخته شده.
    // برای ارسال واقعی، باید API مربوطه رو فراخوانی کنی.
    setTimeout(() => {
      setSuccess('پیام شما با موفقیت ارسال شد. کارشناسان ما به زودی با شما تماس خواهند گرفت.');
      setName('');
      setEmail('');
      setMessage('');
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-medical-blue mb-8 text-center">تماس با ما</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* فرم تماس */}
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
            <h2 className="text-2xl font-semibold text-medical-blue mb-6">ارسال پیام</h2>
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">نام و نام خانوادگی</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:outline-none"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">ایمیل</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:outline-none"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">پیام شما</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="5"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:outline-none"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                  submitting ? 'bg-gray-400' : 'bg-medical-blue hover:bg-medical-blue-dark'
                } transition`}
              >
                {submitting ? 'در حال ارسال...' : 'ارسال پیام'}
              </button>
            </form>
          </div>

          {/* اطلاعات تماس */}
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
            <h2 className="text-2xl font-semibold text-medical-blue mb-6">اطلاعات تماس</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">آدرس دفتر مرکزی</h3>
                <p className="text-gray-600">تهران، خیابان ولیعصر، بالاتر از میدان ونک، پلاک ۱۲۳</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-2">شماره‌های تماس</h3>
                <p className="text-gray-600">☎️ ۰۲۱-۱۲۳۴۵۶۷۸</p>
                <p className="text-gray-600">📱 ۰۹۱۲-۱۲۳۴۵۶۷ (واتساپ)</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-2">ایمیل</h3>
                <p className="text-gray-600">✉️ info@medishop.ir</p>
                <p className="text-gray-600">✉️ support@medishop.ir</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-2">ساعات کاری</h3>
                <p className="text-gray-600">شنبه تا چهارشنبه: ۸ صبح تا ۶ بعدازظهر</p>
                <p className="text-gray-600">پنجشنبه: ۸ صبح تا ۲ بعدازظهر</p>
                <p className="text-gray-600">جمعه: تعطیل</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// --- PublicLayout و کامپوننت‌هایش همان‌طور باقی بمانند ---

// ... (بقیه کامپوننت‌ها مثل Home, ProductsPage, ... بدون تغییر)

// ✅ تابع App جدید (بدون AppContent)
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
        {/* صفحات خصوصی — بدون تغییر */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<ProductManager />} />
        <Route path="/admin/products/edit/:id" element={<EditProduct />} />
        <Route path="/admin/add-product" element={<AddProduct />} />
        <Route path="/admin/categories" element={<CategoryManager />} />
        <Route path="/admin/categories/add" element={<AddCategory />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
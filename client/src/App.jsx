import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import api from './services/api';
import './App.css';

// کامپوننت صفحه اصلی
function Home() {
  const [products, setProducts] = useState([]);
      // داخل کامپوننت Home
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">فروشگاه تجهیزات پزشکی</h1>
      {user && (
  <button
    onClick={() => navigate('/dashboard')}
    className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
  >
    بازگشت به داشبورد
  </button>
)}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="border p-4 rounded">
            <h2 className="font-bold">{p.name}</h2>
            <p>{p.description}</p>
            <p className="text-green-600 font-bold">قیمت: {p.price} تومان</p>
            <button
              onClick={() => addToCart(p.id)}
              className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              افزودن به سبد
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// کامپوننت لاگین کاربر
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await api('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">ورود کاربر</h2>
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
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">ورود</button>
      </form>
    </div>
  );
}

// کامپوننت لاگین ادمین
function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await api('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.user.role !== 'admin') {
        throw new Error('دسترسی ادمین مورد نیاز است.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    }
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

// کامپوننت داشبورد کاربر (به‌روزشده)
function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api('/orders');
        setOrders(data);
      } catch (err) {
        console.error('Error loading orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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

// کامپوننت داشبورد ادمین
function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">داشبورد ادمین</h2>
      <p>نام: {user.name}</p>
      <p>ایمیل: {user.email}</p>
      <p>نقش: {user.role}</p>
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await api('/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, phone, address }),
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'خطا در ثبت‌نام');
    }
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

// کامپوننت سبد خرید
function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await api('/cart');
        setCartItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const removeFromCart = async (id) => {
    try {
      await api(`/cart/${id}`, { method: 'DELETE' });
      setCartItems(cartItems.filter(item => item.id !== id));
    } catch (err) {
      alert('خطا در حذف از سبد: ' + err.message);
    }
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

// کامپوننت اصلی
function AppContent() {
  const user = JSON.parse(localStorage.getItem('user')) || null;

  return (
    <div className="p-6">
      <nav className="mb-6 flex flex-wrap gap-4">
        <Link to="/" className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">خانه</Link>
        <Link to="/cart" className="bg-green-200 hover:bg-green-300 px-4 py-2 rounded">سبد خرید</Link>
        {user ? (
          <>
            <Link to="/dashboard" className="bg-blue-200 hover:bg-blue-300 px-4 py-2 rounded">داشبورد</Link>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/#/';
              }}
              className="bg-red-200 hover:bg-red-300 px-4 py-2 rounded"
            >
              خروج
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="bg-blue-200 hover:bg-blue-300 px-4 py-2 rounded">ورود کاربر</Link>
            <Link to="/admin/login" className="bg-purple-200 hover:bg-purple-300 px-4 py-2 rounded">ورود ادمین</Link>
            <Link to="/register" className="bg-green-200 hover:bg-green-300 px-4 py-2 rounded">ثبت‌نام</Link>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

// کامپوننت نهایی
function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;
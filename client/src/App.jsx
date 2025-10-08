import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import api from './services/api';
import './App.css';

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

function Login() {
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
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      })
      .catch(err => setError(err.message));
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

// کامپوننت داشبورد ادمین (کامل‌شده)
// کامپوننت داشبورد ادمین (اصلاح‌شده)
function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ اول چک کن که توکن وجود داره
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found, redirecting to login...');
      navigate('/admin/login');
      return;
    }

    // دریافت محصولات
    api('/admin/products')
      .then(data => {
        setProducts(data);
      })
      .catch(err => console.error('Error loading products:', err));

    // دریافت سفارشات
    api('/admin/orders')
      .then(data => {
        setOrders(data);
      })
      .catch(err => console.error('Error loading orders:', err));

    // دریافت کاربران
    api('/admin/users')
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading users:', err);
        setLoading(false);
        // اگر خطای 401 بود، به لاگین برگرد
        if (err.message && err.message.includes('Access token')) {
          navigate('/admin/login');
        }
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
      
      {/* لیست محصولات */}
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
                    <td className="border p-2">{product.category || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* لیست سفارشات */}
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

      {/* لیست کاربران */}
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

      <button
        onClick={handleLogout}
        className="mt-4 bg-red-600 text-white p-2 rounded"
      >
        خروج
      </button>
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

function AppContent() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }

    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser) {
        try {
          setUser(JSON.parse(updatedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="p-6">
      <nav className="mb-6">
        <Link to="/" className="mr-2">خانه</Link>
        {' - '}
        <Link to="/cart" className="mr-2">سبد خرید</Link>
        {!user && (
          <>
            {' - '}
            <Link to="/login" className="mr-2">ورود کاربر</Link>
            {' - '}
            <Link to="/admin/login" className="mr-2">ورود ادمین</Link>
            {' - '}
            <Link to="/register" className="mr-2">ثبت‌نام</Link>
          </>
        )}
        {user && (
          <>
            {' - '}
            <Link to="/dashboard">داشبورد</Link>
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

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;
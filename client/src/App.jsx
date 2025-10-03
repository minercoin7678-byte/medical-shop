import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'; // ⚠️ تصحیح نام تابع
import api from './services/api'; // ⚠️ استفاده از فایل api.js
import './App.css';

// کامپوننت صفحه اصلی
function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error:', err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">فروشگاه تجهیزات پزشکی</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="border p-4 rounded">
            <h2 className="font-bold">{p.name}</h2>
            <p>{p.description}</p>
            <p className="text-green-600 font-bold">قیمت: {p.price} تومان</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// کامپوننت لاگین کاربر (به‌روزرسانی‌شده)
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // ⚠️ استفاده از useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await api('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // ذخیره توکن و اطلاعات کاربر
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // هدایت به داشبورد کاربر
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

// کامپوننت لاگین ادمین (به‌روزرسانی‌شده)
function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // ⚠️ استفاده از useNavigate

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

      // ذخیره توکن و اطلاعات
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // هدایت به داشبورد ادمین
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

// کامپوننت داشبورد کاربر (ساده)
function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">داشبورد کاربر</h2>
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

// کامپوننت داشبورد ادمین (ساده)
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

// کامپوننت اصلی
function AppContent() {
  return (
    <div className="p-6">
      <nav className="mb-6">
        <Link to="/" className="mr-4">خانه</Link>
        <Link to="/login">ورود کاربر</Link>
        <Link to="/admin/login" className="ml-4">ورود ادمین</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

// کامپوننت نهایی که HashRouter رو در خودش داره
function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;
import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
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

// کامپوننت لاگین کاربر
function Login() {
  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">ورود کاربر</h2>
      <form>
        <input type="email" placeholder="ایمیل" className="w-full p-2 border mb-2 rounded" />
        <input type="password" placeholder="رمز عبور" className="w-full p-2 border mb-2 rounded" />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">ورود</button>
      </form>
    </div>
  );
}

// کامپوننت لاگین ادمین
function AdminLogin() {
  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">ورود ادمین</h2>
      <form>
        <input type="email" placeholder="ایمیل ادمین" className="w-full p-2 border mb-2 rounded" />
        <input type="password" placeholder="رمز عبور" className="w-full p-2 border mb-2 rounded" />
        <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded">ورود</button>
      </form>
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
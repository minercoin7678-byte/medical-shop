import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CartPage from './pages/CartPage';
import api from './services/api';
import { addToCart } from './services/cartService';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// کامپوننت داخلی که داخل HashRouter استفاده می‌شه
function AppContent() {
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api('/products');
        setProducts(data);
      } catch (err) {
        console.error('خطا در دریافت محصولات:', err);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      setCartCount(prev => prev + 1);
      alert('محصول به سبد خرید اضافه شد!');
    } catch (err) {
      alert('خطا در افزودن به سبد خرید: ' + err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">فروشگاه تجهیزات پزشکی</h1>
        <button
          onClick={() => navigate('/cart')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          سبد خرید ({cartCount})
        </button>
      </div>

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route
          path="/"
          element={
            <div>
              <h1 className="text-2xl font-bold mb-4">محصولات فروشگاه</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="border p-4 rounded">
                    <h2 className="font-bold">{product.name}</h2>
                    <p>{product.description}</p>
                    <p className="text-green-600 font-bold">
                      قیمت: {product.price} تومان
                    </p>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      افزودن به سبد خرید
                    </button>
                  </div>
                ))}
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

// کامپوننت اصلی
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
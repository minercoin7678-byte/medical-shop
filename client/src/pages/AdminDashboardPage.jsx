// src/pages/AdminDashboardPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminDashboardPage() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = JSON.parse(localStorage.getItem('user'));

    if (!token || !savedUser || savedUser.role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    setUser(savedUser);

    // گرفتن داده‌ها
    const fetchData = async () => {
      try {
        const productsData = await api('/admin/products');
        const ordersData = await api('/admin/orders');
        setProducts(productsData);
        setOrders(ordersData.orders || []);
      } catch (err) {
        console.error('خطا در دریافت داده‌ها:', err);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  if (!user) return <div>در حال بارگذاری...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">پنل مدیریت</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          خروج
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">آمار کلی</h2>
          <p>تعداد محصولات: {products.length}</p>
          <p>تعداد سفارشات: {orders.length}</p>
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">آخرین سفارشات</h2>
          {orders.slice(0, 3).map(order => (
            <div key={order.id} className="py-2 border-b">
              <p>سفارش #{order.id} — {order.total_price} تومان</p>
              <p>کاربر: {order.user_name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
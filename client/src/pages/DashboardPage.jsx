// src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // گرفتن اطلاعات کاربر از localStorage
    const savedUser = JSON.parse(localStorage.getItem('user'));
    setUser(savedUser);

    // گرفتن سفارشات از بک‌اند
    const fetchOrders = async () => {
      try {
        const data = await api('/orders');
        setOrders(data.orders || []);
      } catch (err) {
        console.error('خطا در دریافت سفارشات:', err);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return <div>در حال بارگذاری...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">داشبورد کاربری</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          خروج
        </button>
      </div>

      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold">اطلاعات کاربر</h2>
        <p><strong>نام:</strong> {user.name}</p>
        <p><strong>ایمیل:</strong> {user.email}</p>
        <p><strong>نقش:</strong> {user.role === 'admin' ? 'مدیر' : 'کاربر'}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">سفارشات شما</h2>
        {orders.length === 0 ? (
          <p>شما هنوز سفارشی ثبت نکرده‌اید.</p>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="border p-4 rounded">
                <p><strong>شماره سفارش:</strong> #{order.id}</p>
                <p><strong>قیمت کل:</strong> {order.total_price} تومان</p>
                <p><strong>وضعیت:</strong> {order.status}</p>
                <p><strong>تاریخ:</strong> {new Date(order.created_at).toLocaleDateString('fa-IR')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
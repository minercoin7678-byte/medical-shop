// src/pages/AdminLoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminLoginPage() {
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

      // چک کردن نقش ادمین
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
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h2 className="text-2xl font-bold mb-4">ورود ادمین</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">ایمیل ادمین</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">رمز عبور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
        >
          ورود به پنل مدیریت
        </button>
      </form>
    </div>
  );
}
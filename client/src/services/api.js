// src/services/api.js
const API_BASE_URL = '/api'; // به خاطر proxy در vite.config.js

// تابع کمکی برای ارسال درخواست با توکن (اگر وجود داشت)
const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'خطا در ارتباط با سرور');
  }

  return response.json();
};

export default api;